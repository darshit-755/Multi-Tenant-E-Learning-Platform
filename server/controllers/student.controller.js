import { User } from "../models/user.model.js";
import { Student } from "../models/student.model.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const studentProfile = await Student.findOne({ userId });

    return res.status(200).json({
      success: true,
      user,
      profile: studentProfile
        ? {
            rollNumber: studentProfile.rollNumber,
            classLevel: studentProfile.classLevel,
            board: studentProfile.board,
            phone: studentProfile.phone,
            parentName: studentProfile.parentName,
            status: studentProfile.status,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, rollNumber, classLevel, board, phone, parentName, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const studentProfile = await Student.findOne({ userId });
    if (studentProfile) {
      if (rollNumber !== undefined) studentProfile.rollNumber = rollNumber;
      if (classLevel !== undefined) studentProfile.classLevel = classLevel;
      if (board !== undefined) studentProfile.board = board;
      if (phone !== undefined) studentProfile.phone = phone;
      if (parentName !== undefined) studentProfile.parentName = parentName;
      await studentProfile.save();
    }

    await user.save();

    const updatedUser = user.toObject();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      profile: studentProfile
        ? {
            rollNumber: studentProfile.rollNumber,
            classLevel: studentProfile.classLevel,
            board: studentProfile.board,
            phone: studentProfile.phone,
            parentName: studentProfile.parentName,
            status: studentProfile.status,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};