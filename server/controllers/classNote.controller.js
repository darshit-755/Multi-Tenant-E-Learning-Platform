import { Class } from "../models/class.model.js";
import { Tutor } from "../models/tutor.model.js";
import { ClassNote } from "../models/classNote.model.js";
import { Student } from "../models/student.model.js";
import { Batch } from "../models/batch.model.js";

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

const buildPdfUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return files.map((file) => {
    const folder = file.destination?.split(/[\\/]/).pop() || "notes";
    return {
      url: `${baseUrl}/uploads/${folder}/${file.filename}`,
      name: file.originalname || file.filename,
    };
  });
};

const validateTutorClassAccess = async (req, classId) => {
  const { id: userId, tenantId } = req.user;

  const tutorProfile = await Tutor.findOne({ userId, tenantId }).select("_id");
  if (!tutorProfile) {
    return { error: { status: 404, message: "Tutor profile not found" } };
  }

  const classDoc = await Class.findOne({
    _id: classId,
    tenantId,
    teacherId: tutorProfile._id,
  })
    .populate("subjectId", "name")
    .populate("batchId", "name")
    .populate({
      path: "teacherId",
      populate: { path: "userId", select: "name" },
    });

  if (!classDoc) {
    return { error: { status: 404, message: "Class not found" } };
  }

  return {
    tutorProfile,
    classInfo: {
      _id: classDoc._id,
      topic: classDoc.topic || "Class Session",
      subject: classDoc.subjectId?.name || "-",
      batch: classDoc.batchId?.name || "-",
      tutor: classDoc.teacherId?.userId?.name || "-",
      date: formatClassDate(classDoc.date),
      startTime: classDoc.startTime || "-",
      duration: classDoc.duration || 0,
      status: classDoc.status || "scheduled",
    },
  };
};

const validateStudentClassAccess = async (req, classId) => {
  const { id: userId, tenantId } = req.user;

  const studentProfile = await Student.findOne({ userId, tenantId }).select("_id");
  if (!studentProfile) {
    return { error: { status: 404, message: "Student profile not found" } };
  }

  const classDoc = await Class.findOne({
    _id: classId,
    tenantId,
  })
    .populate("subjectId", "name")
    .populate("batchId", "name studentIds")
    .populate({
      path: "teacherId",
      populate: { path: "userId", select: "name" },
    });

  if (!classDoc) {
    return { error: { status: 404, message: "Class not found" } };
  }

  const batchHasStudent =
    Array.isArray(classDoc.batchId?.studentIds) &&
    classDoc.batchId.studentIds.some(
      (studentId) => String(studentId) === String(studentProfile._id)
    );

  if (!batchHasStudent) {
    const studentBatch = await Batch.findOne({
      tenantId,
      _id: classDoc.batchId?._id,
      studentIds: studentProfile._id,
    }).select("_id");

    if (!studentBatch) {
      return { error: { status: 403, message: "Access denied" } };
    }
  }

  return {
    classInfo: {
      _id: classDoc._id,
      topic: classDoc.topic || "Class Session",
      subject: classDoc.subjectId?.name || "-",
      batch: classDoc.batchId?.name || "-",
      tutor: classDoc.teacherId?.userId?.name || "-",
      date: formatClassDate(classDoc.date),
      startTime: classDoc.startTime || "-",
      duration: classDoc.duration || 0,
      status: classDoc.status || "scheduled",
    },
  };
};

export const getClassNotes = async (req, res) => {
  try {
    const { classId } = req.params;
    const accessResult =
      req.user.role === "student"
        ? await validateStudentClassAccess(req, classId)
        : await validateTutorClassAccess(req, classId);

    if (accessResult.error) {
      return res
        .status(accessResult.error.status)
        .json({ message: accessResult.error.message });
    }

    const { tenantId } = req.user;

    const notes = await ClassNote.find({ classId, tenantId })
      .sort({ createdAt: -1 })
      .populate({
        path: "tutorId",
        select: "userId",
        populate: { path: "userId", select: "name email" },
      });

    const normalizedNotes = notes.map((note) => {
      const noteObj = note.toObject();
      noteObj.pdfs = (noteObj.pdfs || [])
        .map((pdf) => {
          if (typeof pdf === "string") {
            const fallbackName = String(pdf).split("/").pop() || "PDF";
            return { url: pdf, name: fallbackName };
          }

          return {
            url: pdf?.url || "",
            name: pdf?.name || String(pdf?.url || "").split("/").pop() || "PDF",
          };
        })
        .filter((pdf) => Boolean(pdf.url));

      return noteObj;
    });

    return res.status(200).json({
      message: "Class notes fetched successfully",
      classInfo: accessResult.classInfo,
      notes: normalizedNotes,
    });
  } catch (error) {
    console.error("Get Class Notes Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addClassNote = async (req, res) => {
  try {
    const { classId } = req.params;
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const pdfs = buildPdfUrls(req, req.files || []);

    if (!content && pdfs.length === 0) {
      return res
        .status(400)
        .json({ message: "Add note content or at least one PDF" });
    }

    const accessResult = await validateTutorClassAccess(req, classId);
    if (accessResult.error) {
      return res
        .status(accessResult.error.status)
        .json({ message: accessResult.error.message });
    }

    const { tenantId } = req.user;

    const note = await ClassNote.create({
      classId,
      tenantId,
      tutorId: accessResult.tutorProfile._id,
      title: title || "Class Note",
      content,
      pdfs,
    });

    await note.populate({
      path: "tutorId",
      select: "userId",
      populate: { path: "userId", select: "name email" },
    });

    return res.status(201).json({
      message: "Note added successfully",
      data: note,
    });
  } catch (error) {
    console.error("Add Class Note Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
