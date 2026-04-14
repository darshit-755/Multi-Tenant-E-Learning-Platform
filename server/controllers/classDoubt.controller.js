import path from "path";
import { Class } from "../models/class.model.js";
import { Tutor } from "../models/tutor.model.js";
import { Student } from "../models/student.model.js";
import { Batch } from "../models/batch.model.js";
import { ClassDoubt } from "../models/classDoubt.model.js";

const formatClassDate = (rawDate) => {
  if (!rawDate) return "-";
  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return String(rawDate);
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildScreenshotUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return files.map((file) => {
    const folder = file.destination?.split(/[\\/]/).pop() || "doubt";
    return `${baseUrl}/uploads/${folder}/${file.filename}`;
  });
};

const getIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
};

const canTutorAccessClass = async ({ userId, tenantId, classDoc }) => {
  const tutorProfile = await Tutor.findOne({ userId, tenantId }).select("_id");
  if (!tutorProfile) return false;
  return getIdString(classDoc.teacherId) === getIdString(tutorProfile._id);
};

const canStudentAccessClass = async ({ userId, tenantId, classDoc }) => {
  const studentProfile = await Student.findOne({ userId, tenantId }).select("_id");
  if (!studentProfile) return false;

  const batchId = classDoc.batchId?._id || classDoc.batchId;

  const batch = await Batch.findOne({ _id: batchId, tenantId }).select(
    "studentIds"
  );
  if (!batch) return false;

  return batch.studentIds.some(
    (studentId) => getIdString(studentId) === getIdString(studentProfile._id)
  );
};

const validateClassAccess = async (req, classId) => {
  const { id: userId, role, tenantId } = req.user;

  const classDoc = await Class.findOne({ _id: classId, tenantId })
    .populate("subjectId", "name")
    .populate("batchId", "name")
    .populate({
      path: "teacherId",
      populate: { path: "userId", select: "name" },
    });

  if (!classDoc) {
    return { error: { status: 404, message: "Class not found" } };
  }

  let hasAccess = false;
  if (role === "tutor") {
    hasAccess = await canTutorAccessClass({ userId, tenantId, classDoc });
  }
  if (role === "student") {
    hasAccess = await canStudentAccessClass({ userId, tenantId, classDoc });
  }

  if (!["student", "tutor"].includes(role)) {
    return { error: { status: 403, message: "You cannot access this class doubts" } };
  }

  if (!hasAccess) {
    return { error: { status: 403, message: "You cannot access this class doubts" } };
  }

  const classInfo = {
    _id: classDoc._id,
    topic: classDoc.topic || "Class Session",
    subject: classDoc.subjectId?.name || "-",
    batch: classDoc.batchId?.name || "-",
    tutor: classDoc.teacherId?.userId?.name || "-",
    date: formatClassDate(classDoc.date),
    startTime: classDoc.startTime || "-",
    duration: classDoc.duration || 0,
    status: classDoc.status || "scheduled",
  };

  return { classInfo };
};

export const getClassDoubtConversation = async (req, res) => {
  try {
    const { classId } = req.params;
    const accessResult = await validateClassAccess(req, classId);

    if (accessResult.error) {
      return res
        .status(accessResult.error.status)
        .json({ message: accessResult.error.message });
    }

    const { tenantId } = req.user;

    const thread = await ClassDoubt.findOne({ classId, tenantId })
      .populate("messages.senderUserId", "name email role")
      .select("messages");

    return res.status(200).json({
      message: "Class doubts fetched successfully",
      classInfo: accessResult.classInfo,
      messages: thread?.messages || [],
    });
  } catch (error) {
    console.error("Get Class Doubt Conversation Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addClassDoubtMessage = async (req, res) => {
  try {
    const { classId } = req.params;
    const text = String(req.body?.text || "").trim();
    const screenshots = buildScreenshotUrls(req, req.files || []);

    if (!text && screenshots.length === 0) {
      return res
        .status(400)
        .json({ message: "Add message text or at least one screenshot" });
    }

    const accessResult = await validateClassAccess(req, classId);
    if (accessResult.error) {
      return res
        .status(accessResult.error.status)
        .json({ message: accessResult.error.message });
    }

    const { id: userId, role, tenantId } = req.user;

    const thread =
      (await ClassDoubt.findOne({ classId, tenantId })) ||
      (await ClassDoubt.create({ classId, tenantId, messages: [] }));

    thread.messages.push({
      senderUserId: userId,
      senderRole: role,
      text,
      screenshots,
    });

    await thread.save();
    await thread.populate("messages.senderUserId", "name email role");

    return res.status(201).json({
      message: "Doubt message sent successfully",
      data: thread.messages[thread.messages.length - 1],
    });
  } catch (error) {
    console.error("Add Class Doubt Message Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
