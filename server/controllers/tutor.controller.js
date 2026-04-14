import { User } from "../models/user.model.js";
import { Tutor } from "../models/tutor.model.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tutorProfile = await Tutor.findOne({ userId });

    return res.status(200).json({
      success: true,
      user,
      profile: tutorProfile
        ? {
            subjects: tutorProfile.subjects,
            experienceYears: tutorProfile.experienceYears,
            phone: tutorProfile.phone,
            status: tutorProfile.status,
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

    const { name, email, phone, subjects, experienceYears, password } = req.body;

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
      const folder = req.file.destination.split(/[/\\]/).pop() || "profile";
      user.profileImage = `/uploads/${folder}/${req.file.filename}`;
    }

    const tutorProfile = await Tutor.findOne({ userId });

    if (tutorProfile) {
      if (phone !== undefined) tutorProfile.phone = phone;

      if (subjects !== undefined) {
        const normalizedSubjects = Array.isArray(subjects)
          ? subjects.map((subject) => String(subject).trim()).filter(Boolean)
          : typeof subjects === "string"
            ? subjects
                .split(",")
                .map((subject) => subject.trim())
                .filter(Boolean)
            : [];

        tutorProfile.subjects = normalizedSubjects;
      }

      if (experienceYears !== undefined && !Number.isNaN(Number(experienceYears))) {
        tutorProfile.experienceYears = Number(experienceYears);
      }

      await tutorProfile.save();
    }

    await user.save();

    const updatedUser = user.toObject();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      profile: tutorProfile
        ? {
            subjects: tutorProfile.subjects,
            experienceYears: tutorProfile.experienceYears,
            phone: tutorProfile.phone,
            status: tutorProfile.status,
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