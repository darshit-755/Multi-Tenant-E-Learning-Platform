// Delete a class note
export const deleteClassNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { tenantId } = req.user;
    const note = await ClassNote.findOneAndDelete({ _id: noteId, tenantId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete Class Note Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Update a class note
export const updateClassNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { tenantId } = req.user;
    const note = await ClassNote.findOne({ _id: noteId, tenantId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Only update fields that are present in the request
    if (typeof req.body.title === "string") note.title = req.body.title.trim();
    if (typeof req.body.content === "string") note.content = req.body.content.trim();
    if (typeof req.body.contentType === "string") note.contentType = req.body.contentType;
    if (typeof req.body.lectureLink === "string") note.lectureLink = req.body.lectureLink.trim();
    const pdfFileName = String(req.body?.pdfFileName || "").trim();

    // Handle file replacements
    if (req.files && req.files.notePdfs) {
      note.pdfs = buildUploadedFileObjects(req, req.files.notePdfs, "notes", pdfFileName);
    }
    if (req.files && req.files.lectureVideos) {
      // Get class topic for video naming
      const classDoc = await Class.findById(note.classId).select("topic");
      const classTitle = classDoc?.topic || "Video Lecture";
      note.videos = buildUploadedFileObjectsWithClassTitle(
        req,
        req.files.lectureVideos,
        classTitle,
        "lectures"
      );
    }

    await note.save();
    return res.status(200).json({ message: "Note updated successfully", data: note });
  } catch (error) {
    console.error("Update Class Note Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
import { Class } from "../models/class.model.js";
import { Tutor } from "../models/tutor.model.js";
import { ClassNote } from "../models/classNote.model.js";
import { Student } from "../models/student.model.js";
import { Batch } from "../models/batch.model.js";
import { buildUploadedFileObjectsWithClassTitle } from "../utils/fileHelper.js";

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

const buildUploadedFileObjects = (
  req,
  files = [],
  fallbackFolder = "misc",
  customDisplayName = ""
) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const displayName = String(customDisplayName || "").trim();

  return files.map((file, index) => {
    const folder = file.destination?.split(/[\\/]/).pop() || fallbackFolder;
    const resolvedName = displayName
      ? `${displayName}${files.length > 1 ? ` (Part ${index + 1})` : ""}`
      : file.originalname || file.filename;

    return {
      url: `${baseUrl}/uploads/${folder}/${file.filename}`,
      name: resolvedName,
    };
  });
};

const normalizeAttachmentList = (items = [], fallbackName = "File") => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item === "string") {
        const fallback = String(item).split("/").pop() || fallbackName;
        return { url: item, name: fallback };
      }

      return {
        url: item?.url || "",
        name: item?.name || String(item?.url || "").split("/").pop() || fallbackName,
      };
    })
    .filter((item) => Boolean(item.url));
};

const isValidHttpUrl = (urlValue = "") => {
  try {
    const parsedUrl = new URL(urlValue);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (_error) {
    return false;
  }
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
      noteObj.contentType = noteObj.contentType || "note";
      noteObj.pdfs = normalizeAttachmentList(noteObj.pdfs, "PDF");
      noteObj.videos = normalizeAttachmentList(noteObj.videos, "Video");
      noteObj.lectureLink = String(noteObj.lectureLink || "").trim();

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
    const contentType =
      String(req.body?.contentType || "note").trim() === "videoLecture"
        ? "videoLecture"
        : "note";
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const lectureLink = String(req.body?.lectureLink || "").trim();
    const pdfFileName = String(req.body?.pdfFileName || "").trim();

    const notePdfFiles = Array.isArray(req.files?.notePdfs) ? req.files.notePdfs : [];
    const lectureVideoFiles = Array.isArray(req.files?.lectureVideos)
      ? req.files.lectureVideos
      : [];

    const pdfs = buildUploadedFileObjects(req, notePdfFiles, "notes", pdfFileName);
    
    // Get class topic for video naming
    const classDoc = await Class.findById(classId).select("topic");
    const classTitle = classDoc?.topic || "Video Lecture";
    const videos = buildUploadedFileObjectsWithClassTitle(
      req,
      lectureVideoFiles,
      classTitle,
      "lectures"
    );

    if (lectureLink && !isValidHttpUrl(lectureLink)) {
      return res
        .status(400)
        .json({ message: "Lecture link must be a valid http/https URL" });
    }

    const hasNoteContent = Boolean(content) || pdfs.length > 0;
    const hasVideoContent = Boolean(lectureLink) || videos.length > 0;

    if (contentType === "note" && !hasNoteContent) {
      return res
        .status(400)
        .json({ message: "Add note content or at least one PDF" });
    }

    if (contentType === "videoLecture" && !hasVideoContent) {
      return res
        .status(400)
        .json({ message: "Add lecture link or upload at least one video" });
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
      contentType,
      title: title || (contentType === "videoLecture" ? "Video Lecture" : "Class Note"),
      content,
      lectureLink,
      pdfs,
      videos,
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
