import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Tenant } from "../models/tenant.model.js";
import { Tutor } from "../models/tutor.model.js";
import { Student } from "../models/student.model.js";
import { sendTenantMail } from "../services/mail/mail.service.js";
import { MAIL_TYPES } from "../services/mail/mail.constant.js";
import { isIndianMobileNumber } from "../utils/phone.js";

const dummyEmail = "voltix755@gmail.com";

// Register a tutor (by tenant)
export const registerTutor = async (req, res) => {
  try {
    const { name, email, password, subjects, experienceYears, phone } =
      req.body;
    const tenantId = req.user.tenantId; // From auth middleware
    const parsedExperienceYears = Number(experienceYears)

    const normalizedSubjects = Array.isArray(subjects)
      ? subjects.map((subject) => String(subject).trim()).filter(Boolean)
      : typeof subjects === "string"
        ? subjects
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean)
        : [];

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      normalizedSubjects.length === 0 ||
      Number.isNaN(parsedExperienceYears)
    ) {
      return res.status(400).json({
        message:
          "name, email, password, phone, subjects and experienceYears are required",
      });
    }

    if (!isIndianMobileNumber(phone)) {
      return res.status(400).json({
        message: "Phone must be a valid 10-digit Indian mobile number",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create tutor user
    const tutorUser = await User.create({
      name,
      email,
      passwordHash,
      role: "tutor",
      tenantId: tenantId,
      status: "active", // Tutor is active immediately
    });

    // Create tutor profile
    const tutorProfile = await Tutor.create({
      tenantId,
      userId: tutorUser._id,
      subjects: normalizedSubjects,
      experienceYears: parsedExperienceYears,
      phone,
      status: "active",
    });

    await sendTenantMail(MAIL_TYPES.TUTOR_ADDED, {
      name: tutorUser.name,
      email: dummyEmail,
      // email: tutorUser.email,
    });

    return res.status(201).json({
      message: "Tutor registered successfully",
      tutor: {
        _id: tutorUser._id,
        tutorId: tutorProfile._id,
        name: tutorUser.name,
        email: tutorUser.email,
        role: tutorUser.role,
        subjects: tutorProfile.subjects,
        experienceYears: tutorProfile.experienceYears,
        phone: tutorProfile.phone,
        status: tutorProfile.status,
      },
    });
  } catch (error) {
    console.error("Tutor Registration Error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get all tutors for a tenant
export const getTutorsByTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const tutorProfiles = await Tutor.find({ tenantId })
      .populate("userId", "name email role status createdAt")
      .sort({ createdAt: -1 });

    const tutors = tutorProfiles
      .filter((profile) => profile.userId)
      .map((profile) => ({
        _id: profile.userId._id,
        tutorId: profile._id,
        name: profile.userId.name,
        email: profile.userId.email,
        role: profile.userId.role,
        status: profile.status,
        subjects: profile.subjects,
        experienceYears: profile.experienceYears,
        phone: profile.phone,
        createdAt: profile.createdAt,
      }));

    return res.status(200).json({
      message: "Tutors fetched successfully",
      tutors,
    });
  } catch (error) {
    console.error("Get Tutors Error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// Delete a tutor
export const deleteTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const tenantId = req.user.tenantId;

    const tutorProfile = await Tutor.findOne({
      tenantId,
      $or: [{ _id: tutorId }, { userId: tutorId }],
    });

    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    await User.findByIdAndDelete(tutorProfile.userId);
    await Tutor.findByIdAndDelete(tutorProfile._id);

    return res.status(200).json({
      message: "Tutor deleted successfully",
    });
  } catch (error) {
    console.error("Delete Tutor Error:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// Update a tutor
export const updateTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { name, email, subjects, experienceYears, phone, status } = req.body;
    const tenantId = req.user.tenantId;

    const tutorProfile = await Tutor.findOne({
      tenantId,
      $or: [{ _id: tutorId }, { userId: tutorId }],
    });

    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const tutorUser = await User.findById(tutorProfile.userId);
    if (!tutorUser) {
      return res.status(404).json({ message: "Tutor user not found" });
    }

    const normalizedSubjects = Array.isArray(subjects)
      ? subjects.map((subject) => String(subject).trim()).filter(Boolean)
      : typeof subjects === "string"
        ? subjects
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean)
        : null;

    if (
      (subjects !== undefined && normalizedSubjects?.length === 0) ||
      (experienceYears !== undefined &&
        (Number.isNaN(Number(experienceYears)) || Number(experienceYears) < 0))
    ) {
      return res.status(400).json({
        message: "Invalid tutor data",
      });
    }

    if (phone !== undefined && phone !== "" && !isIndianMobileNumber(phone)) {
      return res.status(400).json({
        message: "Phone must be a valid 10-digit Indian mobile number",
      });
    }

    if (email && email !== tutorUser.email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== tutorUser._id.toString()
      ) {
        return res.status(400).json({ message: "Email already exists" });
      }
      tutorUser.email = email;
    }

    if (name !== undefined) tutorUser.name = name;
    await tutorUser.save();

    if (normalizedSubjects) tutorProfile.subjects = normalizedSubjects;
    if (experienceYears !== undefined) {
      tutorProfile.experienceYears = Number(experienceYears);
    }
    if (phone !== undefined) tutorProfile.phone = phone;
    if (status !== undefined) tutorProfile.status = status;

    await tutorProfile.save();

    return res.status(200).json({
      message: "Tutor updated successfully",
      tutor: {
        _id: tutorUser._id,
        tutorId: tutorProfile._id,
        name: tutorUser.name,
        email: tutorUser.email,
        role: tutorUser.role,
        status: tutorProfile.status,
        subjects: tutorProfile.subjects,
        experienceYears: tutorProfile.experienceYears,
        phone: tutorProfile.phone,
      },
    });
  } catch (error) {
    console.error("Update Tutor Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Register a student (by tenant)
export const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      classLevel,
      board,
      phone,
      parentName,
    } = req.body;
    const tenantId = req.user.tenantId;

    if (
      !name ||
      !email ||
      !password ||
      !rollNumber ||
      !classLevel ||
      !board ||
      !phone ||
      !parentName
    ) {
      return res.status(400).json({
        message:
          "name, email, password, rollNumber, classLevel, board, phone and parentName are required",
      });
    }

    if (!isIndianMobileNumber(phone)) {
      return res.status(400).json({
        message: "Phone must be a valid 10-digit Indian mobile number",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const studentUser = await User.create({
      name,
      email,
      passwordHash,
      role: "student",
      tenantId,
      status: "active",
    });

    const studentProfile = await Student.create({
      tenantId,
      userId: studentUser._id,
      rollNumber,
      classLevel,
      board,
      phone,
      parentName,
      status: "active",
    });

    await sendTenantMail(MAIL_TYPES.STUDENT_ADDED, {
      name: studentUser.name,
      email: dummyEmail,
      // email: studentUser.email,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student: {
        _id: studentUser._id,
        studentId: studentProfile._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        rollNumber: studentProfile.rollNumber,
        classLevel: studentProfile.classLevel,
        board: studentProfile.board,
        phone: studentProfile.phone,
        parentName: studentProfile.parentName,
        status: studentProfile.status,
      },
    });
  } catch (error) {
    console.error("Student Registration Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all students for a tenant
export const getStudentsByTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const studentProfiles = await Student.find({ tenantId })
      .populate("userId", "name email role status createdAt")
      .sort({ createdAt: -1 });

    const students = studentProfiles
      .filter((profile) => profile.userId)
      .map((profile) => ({
        _id: profile.userId._id,
        studentId: profile._id,
        name: profile.userId.name,
        email: profile.userId.email,
        role: profile.userId.role,
        status: profile.status,
        rollNumber: profile.rollNumber,
        classLevel: profile.classLevel,
        board: profile.board,
        phone: profile.phone,
        parentName: profile.parentName,
        createdAt: profile.createdAt,
      }));

    return res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    console.error("Get Students Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.user.tenantId;

    const studentProfile = await Student.findOne({
      tenantId,
      $or: [{ _id: studentId }, { userId: studentId }],
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findByIdAndDelete(studentProfile.userId);
    await Student.findByIdAndDelete(studentProfile._id);

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Update a student
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      name,
      email,
      rollNumber,
      classLevel,
      board,
      phone,
      parentName,
      status,
    } = req.body;
    const tenantId = req.user.tenantId;

    const studentProfile = await Student.findOne({
      tenantId,
      $or: [{ _id: studentId }, { userId: studentId }],
    });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentUser = await User.findById(studentProfile.userId);
    if (!studentUser) {
      return res.status(404).json({ message: "Student user not found" });
    }

    if (email && email !== studentUser.email) {
      const existingUser = await User.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== studentUser._id.toString()
      ) {
        return res.status(400).json({ message: "Email already exists" });
      }
      studentUser.email = email;
    }

    if (name !== undefined) studentUser.name = name;
    await studentUser.save();

    if (rollNumber !== undefined) studentProfile.rollNumber = rollNumber;
    if (classLevel !== undefined) studentProfile.classLevel = classLevel;
    if (board !== undefined) studentProfile.board = board;
    if (phone !== undefined && phone !== "") {
      if (!isIndianMobileNumber(phone)) {
        return res.status(400).json({
          message: "Phone must be a valid 10-digit Indian mobile number",
        });
      }

      studentProfile.phone = phone;
    }
    if (parentName !== undefined) studentProfile.parentName = parentName;
    if (status !== undefined) studentProfile.status = status;

    await studentProfile.save();

    return res.status(200).json({
      message: "Student updated successfully",
      student: {
        _id: studentUser._id,
        studentId: studentProfile._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        status: studentProfile.status,
        rollNumber: studentProfile.rollNumber,
        classLevel: studentProfile.classLevel,
        board: studentProfile.board,
        phone: studentProfile.phone,
        parentName: studentProfile.parentName,
      },
    });
  } catch (error) {
    console.error("Update Student Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const { name, email, tenantName, password } = req.body;

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

    let tenantProfile = null;
    if (tenantId) {
      tenantProfile = await Tenant.findById(tenantId);
      if (tenantProfile && tenantName !== undefined) {
        tenantProfile.name = tenantName;
        await tenantProfile.save();
      }
    }

    await user.save();

    const updatedUser = user.toObject();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      profile: tenantProfile
        ? {
            tenantName: tenantProfile.name,
            plan: tenantProfile.plan,
            status: tenantProfile.status,
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

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (tenant) {
        profile = {
          tenantName: tenant.name,
          plan: tenant.plan,
          status: tenant.status,
        };
      }
    }

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
