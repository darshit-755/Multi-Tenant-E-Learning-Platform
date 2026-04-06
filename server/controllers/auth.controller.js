import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { Tenant } from "../models/tenant.model.js";
import { User } from "../models/user.model.js";
import { sendTenantMail } from "../services/mail/mail.service.js";
import { MAIL_TYPES } from "../services/mail/mail.constant.js";
// import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerTenant = async (req, res) => {
  try {
    const { tenantName, name, email, password } = req.body;

    if (!tenantName || !name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "tenant",
      tenantId: null,
      status: "inactive",
      onlineStatus: false,
    });

    const tenant = await Tenant.create({
      name: tenantName,
      ownerUserId: user._id,
      status: "inactive",
      plan: "free",
    });

    user.tenantId = tenant._id;
    await user.save();

    // Mail to admin
    sendTenantMail(MAIL_TYPES.TENANT_REGISTER_ADMIN, user).catch((err) =>
      console.error("Admin Mail Error:", err),
    );

    // Mail to tenant
    sendTenantMail(MAIL_TYPES.TENANT_WELCOME, user);

    return res.status(201).json({
      message: "Registration submitted. Wait for admin approval.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Tenant validation
    if (user.role !== "superadmin") {
      const tenant = await Tenant.findById(user.tenantId);

      if (!tenant) {
        return res.status(403).json({
          message: "Tenant not found. Please contact support.",
        });
      }

      if (tenant.status === "inactive") {
        return res.status(403).json({
          message: "Your account is pending admin approval.",
        });
      }

      if (tenant.status === "blocked") {
        return res.status(403).json({
          message: "Your account has been blocked.",
        });
      }
    }
    if (user.role === "student" || user.role === "tutor") {
      if (user.status === "inactive") {
        return res.status(403).json({
          message:
            "Your account is inactive. Please contact your tenant admin.",
        });
      }
    }
    // console.log("user:", user);

    /* MARK USER ONLINE */
    user.onlineStatus = true;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      onlineStatus: false,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist.",
      });
    }

    // const resetToken = crypto.randomBytes(32).toString("hex");

    // const hashedToken = crypto
    //   .createHash("sha256")
    //   .update(resetToken)
    //   .digest("hex");

    const resetToken = Math.random().toString(32).substring(2);

    // const hashedToken = await bcrypt.hash(resetToken, 10);
    // console.log("forgot : " , hashedToken)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    /* 🔹 FRONTEND RESET PAGE */
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendTenantMail(MAIL_TYPES.PASSWORD_RESET, user, { resetLink });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // const hashedToken = await bcrypt.hash(token, 10);
    // const hashedToken = crypto
    //   .createHash("sha256")
    //   .update(token)
    //   .digest("hex");

    //  console.log("reset : " , hashedToken)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.passwordHash = hashedPassword;

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    //         console.log("BACKEND CLIENT ID:", process.env.GOOGLE_CLIENT_ID);

    //         const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // console.log("TOKEN AUD:", decoded.aud);

    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        profileImage: picture,
        role: "tenant",
        tenantId: null,
        status: "inactive",
        onlineStatus: true,
        // No password for Google auth users
        passwordHash: Math.random().toString(36),
      });

      // Create a default tenant for the user
      const tenant = await Tenant.create({
        name: `${name}'s Organization`,
        ownerUserId: user._id,
        status: "inactive",
        plan: "free",
      });

      user.tenantId = tenant._id;
      await user.save();

      // Send admin notification
      sendTenantMail(MAIL_TYPES.TENANT_REGISTER_ADMIN, user).catch((err) =>
        console.error("Admin Mail Error:", err),
      );

      // Send welcome email
      sendTenantMail(MAIL_TYPES.TENANT_WELCOME, user).catch((err) =>
        console.error("Welcome Mail Error:", err),
      );

      // Return success with status - user needs admin approval
      return res.status(200).json({
        message:
          "Registration successful! Your account is pending admin approval.",
        token: null,
        userStatus: "inactive",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          status: "inactive",
          profileImage: user.profileImage,
        },
      });
    } else {
      // Check user status
      if (user.status === "blocked") {
        return res.status(403).json({
          message: "Your account has been blocked",
        });
      }

      // Update user's online status and profile image if needed
      user.onlineStatus = true;
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      await user.save();

      // Check tenant status for non-superadmin users
      if (user.role !== "superadmin" && user.tenantId) {
        const tenant = await Tenant.findById(user.tenantId);

        if (!tenant) {
          return res.status(403).json({
            message: "Tenant not found. Please contact support.",
          });
        }

        if (tenant.status === "inactive") {
          return res.status(403).json({
            message: "Your account is pending admin approval.",
          });
        }

        if (tenant.status === "blocked") {
          return res.status(403).json({
            message: "Your account has been blocked.",
          });
        }
      }

      if (user.role === "student" || user.role === "tutor") {
        if (user.status === "inactive") {
          return res.status(403).json({
            message:
              "Your account is inactive. Please contact your tenant admin.",
          });
        }
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        status: user.status,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};
