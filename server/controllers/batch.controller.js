import { Batch } from "../models/batch.model.js";
import { Subject } from "../models/subject.model.js";
import { Tutor } from "../models/tutor.model.js";
import { Student } from "../models/student.model.js";

export const createBatch = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, subjectId, teacherId, studentIds, status } = req.body;

    if (!name || !subjectId || !teacherId) {
      return res.status(400).json({
        message: "name, subjectId and teacherId are required",
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const teacher = await Tutor.findOne({ _id: teacherId, tenantId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let validStudentIds = [];
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      const students = await Student.find({
        _id: { $in: studentIds },
        tenantId,
      }).select("_id");

      if (students.length !== studentIds.length) {
        return res.status(400).json({
          message: "One or more students not found in your institute",
        });
      }

      validStudentIds = students.map((student) => student._id);
    }

    const batch = await Batch.create({
      tenantId,
      name: String(name).trim(),
      subjectId,
      teacherId,
      studentIds: validStudentIds,
      status: status || "active",
    });

    const populatedBatch = await Batch.findById(batch._id)
      .populate("subjectId", "name status")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      });

    return res.status(201).json({
      message: "Batch created successfully",
      batch: populatedBatch,
    });
  } catch (error) {
    console.error("Create Batch Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { batchId } = req.params;
    const { name, status } = req.body;

    const batch = await Batch.findOne({ _id: batchId, tenantId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (name !== undefined) batch.name = String(name).trim();
    if (status !== undefined) batch.status = status;

    await batch.save();

    const populatedBatch = await Batch.findById(batch._id)
      .populate("subjectId", "name status")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      });

    return res.status(200).json({
      message: "Batch updated successfully",
      batch: populatedBatch,
    });
  } catch (error) {
    console.error("Update Batch Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getBatchesByTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const batches = await Batch.find({ tenantId })
      .populate("subjectId", "name status")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Batches fetched successfully",
      batches,
    });
  } catch (error) {
    console.error("Get Batches Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getBatchesByTutor = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const tutor = await Tutor.findOne({ userId: tutorId });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const batches = await Batch.find({ teacherId: tutor._id })
      .populate("subjectId", "name status")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Batches fetched successfully",
      batches,
    });
  } catch (error) {
    console.error("Get Batches Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getBatchesByStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const studentProfile = await Student.findOne({ userId, tenantId });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const batches = await Batch.find({
      tenantId,
      studentIds: studentProfile._id,
    })
      .populate("subjectId", "name status")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Batches fetched successfully",
      batches,
    });
  } catch (error) {
    console.error("Get Student Batches Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
