import { Attendance } from "../models/attendance.model.js";
import { Class } from "../models/class.model.js";
import { Batch } from "../models/batch.model.js";
import { Student } from "../models/student.model.js";
import { Tutor } from "../models/tutor.model.js";
import { VideoProgress } from "../models/videoProgress.model.js";
import { recordAttendanceEvent } from "../services/attendanceTracking.service.js";

const buildStudentAttendancePayload = async (studentId, tenantId) => {
  const student = await Student.findOne({ _id: studentId, tenantId }).populate({
    path: "userId",
    select: "name email",
  });

  if (!student) {
    return { notFound: true };
  }

  const attendance = await Attendance.find({ studentId, tenantId, isProgressOnly: { $ne: true } })
    .populate({
      path: "classId",
      select: "date startTime duration subject topic status",
      populate: [
        {
          path: "subjectId",
          select: "name",
        },
        {
          path: "teacherId",
          populate: { path: "userId", select: "name" },
        },
      ],
    })
    .sort({ createdAt: -1 });

  const presentCount = attendance.filter((record) => record.present).length;
  const totalClasses = attendance.length;
  const attendancePercentage =
    totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

  const attendanceRecords = attendance
    .filter((record) => record.classId)
    .map((record) => ({
      _id: record._id,
      classId: record.classId._id,
      classDate: record.classId.date,
      classTime: record.classId.startTime,
      subject: record.classId.subjectId?.name,
      topic: record.classId.topic,
      tutorName: record.classId.teacherId?.userId?.name,
      present: record.present,
      markedAt: record.markedAt,
      notes: record.notes,
      trackingProvider: record.trackingProvider,
      firstJoinAt: record.firstJoinAt,
      lastJoinAt: record.lastJoinAt,
      lastLeaveAt: record.lastLeaveAt,
      totalDurationMinutes: record.totalDurationMinutes || 0,
      videoMaxProgress: record.videoMaxProgress || 0,
    }));

  return {
    student: {
      _id: student._id,
      name: student.userId.name,
      email: student.userId.email,
    },
    statistics: {
      totalClasses,
      presentCount,
      absentCount: totalClasses - presentCount,
      attendancePercentage: attendancePercentage.toFixed(2),
    },
    attendance: attendanceRecords,
  };
};

// Mark attendance for multiple students in a class
export const markAttendance = async (req, res) => {
  try {
    const { classId, attendanceData } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    if (!classId || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        message: "classId and attendanceData (array) are required",
      });
    }

    // Verify class exists and belongs to tenant
    const classRecord = await Class.findOne({ _id: classId, tenantId });
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Only allow attendance marking after class is completed
    if (classRecord.status !== "completed") {
      return res.status(400).json({
        message: "Attendance can only be marked after the class is completed",
      });
    }

    const tutorProfile = await Tutor.findOne({ userId, tenantId }).select("_id");
    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Verify tutor is the one teaching this class
    if (String(classRecord.teacherId) !== String(tutorProfile._id)) {
      return res.status(403).json({
        message: "You are not authorized to mark attendance for this class",
      });
    }

    // Get batch information to verify students
    const batch = await Batch.findById(classRecord.batchId).populate("studentIds");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Create/update attendance records
    const results = [];
    for (const record of attendanceData) {
      const { studentId, present, notes } = record;

      // Verify student belongs to this batch
      const studentInBatch = batch.studentIds.some(
        (s) => String(s._id) === String(studentId)
      );
      if (!studentInBatch) {
        results.push({
          studentId,
          success: false,
          message: "Student not found in this batch",
        });
        continue;
      }

      try {
        const attendance = await Attendance.findOneAndUpdate(
          { classId, studentId, tenantId },
          {
            tenantId,
            classId,
            studentId,
            tutorId: tutorProfile._id,
            present: Boolean(present),
            notes: notes || "",
            markedAt: new Date(),
          },
          { upsert: true, new: true, runValidators: true }
        );

        results.push({
          studentId,
          success: true,
          attendanceId: attendance._id,
          present: attendance.present,
        });
      } catch (error) {
        results.push({
          studentId,
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      message: "Attendance marked successfully",
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error marking attendance",
      error: error.message,
    });
  }
};

// Get attendance for a specific class
export const getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const tenantId = req.user.tenantId;

    // Verify class exists
    const classRecord = await Class.findOne({ _id: classId, tenantId });
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Get batch students
    const batch = await Batch.findById(classRecord.batchId).populate("studentIds");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Get attendance records
    const attendance = await Attendance.find({ classId, tenantId, isProgressOnly: { $ne: true } })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email" },
      })
      .sort("studentId");

    // Create attendance map
    const attendanceMap = {};
    attendance.forEach((record) => {
      attendanceMap[record.studentId._id] = {
        _id: record._id,
        present: record.present,
        markedAt: record.markedAt,
        notes: record.notes,
        trackingProvider: record.trackingProvider,
        firstJoinAt: record.firstJoinAt,
        lastJoinAt: record.lastJoinAt,
        lastLeaveAt: record.lastLeaveAt,
        totalDurationMinutes: record.totalDurationMinutes,
      };
    });

    // Build response with all students in batch
    const attendanceRecords = batch.studentIds.map((student) => {
      const attendanceRecord = attendanceMap[student._id];
      return {
        studentId: student._id,
        studentName: student.userId.name,
        studentEmail: student.userId.email,
        present: attendanceRecord ? attendanceRecord.present : null,
        markedAt: attendanceRecord ? attendanceRecord.markedAt : null,
        notes: attendanceRecord ? attendanceRecord.notes : "",
        trackingProvider: attendanceRecord ? attendanceRecord.trackingProvider : "manual",
        firstJoinAt: attendanceRecord ? attendanceRecord.firstJoinAt : null,
        lastJoinAt: attendanceRecord ? attendanceRecord.lastJoinAt : null,
        lastLeaveAt: attendanceRecord ? attendanceRecord.lastLeaveAt : null,
        totalDurationMinutes: attendanceRecord
          ? attendanceRecord.totalDurationMinutes || 0
          : 0,
        videoMaxProgress: attendanceRecord ? attendanceRecord.videoMaxProgress || 0 : 0,
        _id: attendanceRecord ? attendanceRecord._id : null,
      };
    });

    res.status(200).json({
      classId,
      classDate: classRecord.date,
      classStartTime: classRecord.startTime,
      totalStudents: attendanceRecords.length,
      presentCount: attendanceRecords.filter((r) => r.present).length,
      absentCount: attendanceRecords.filter((r) => r.present === false).length,
      notMarkedCount: attendanceRecords.filter((r) => r.present === null).length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message,
    });
  }
};

// Get attendance history for a student
export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.user.tenantId;

    const payload = await buildStudentAttendancePayload(studentId, tenantId);
    if (payload.notFound) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student attendance",
      error: error.message,
    });
  }
};

// Get attendance for logged in student
export const getMyAttendance = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    const student = await Student.findOne({ userId, tenantId }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const payload = await buildStudentAttendancePayload(student._id, tenantId);
    if (payload.notFound) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student attendance",
      error: error.message,
    });
  }
};

// Track student join/leave events for online classes
export const trackMeetingAttendance = async (req, res) => {
  try {
    const { classId, action, provider, occurredAt } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    if (!classId || !action) {
      return res.status(400).json({
        message: "classId and action are required",
      });
    }

    if (!["join", "leave"].includes(action)) {
      return res.status(400).json({
        message: "action must be join or leave",
      });
    }

    const student = await Student.findOne({ userId, tenantId }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const classRecord = await Class.findOne({ _id: classId, tenantId }).select(
      "_id tenantId batchId teacherId videoProvider"
    );
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    const batch = await Batch.findById(classRecord.batchId).select("studentIds");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const studentExists = batch.studentIds.some(
      (id) => String(id) === String(student._id)
    );
    if (!studentExists) {
      return res.status(403).json({
        message: "You are not enrolled in this class",
      });
    }

    const attendance = await recordAttendanceEvent({
      tenantId,
      classId: classRecord._id,
      studentId: student._id,
      tutorId: classRecord.teacherId,
      provider: provider || classRecord.videoProvider || "manual",
      action,
      occurredAt,
      source: "client",
    });

    return res.status(200).json({
      message: `Attendance ${action} event tracked`,
      attendance: {
        _id: attendance._id,
        classId: attendance.classId,
        studentId: attendance.studentId,
        present: attendance.present,
        joinCount: attendance.joinCount,
        leaveCount: attendance.leaveCount,
        firstJoinAt: attendance.firstJoinAt,
        lastJoinAt: attendance.lastJoinAt,
        lastLeaveAt: attendance.lastLeaveAt,
        totalDurationMinutes: attendance.totalDurationMinutes || 0,
        trackingProvider: attendance.trackingProvider,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error tracking attendance event",
      error: error.message,
    });
  }
};

// Get attendance summary for all students in a batch (for analytics)
export const getAttendanceSummary = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tenantId = req.user.tenantId;

    // Verify batch exists
    const batch = await Batch.findOne({ _id: batchId, tenantId }).populate({
      path: "studentIds",
      populate: { path: "userId", select: "name email" },
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Get all classes for this batch
    const classes = await Class.find({ batchId, tenantId }).sort({ date: -1 });
    const classIds = classes.map((cls) => cls._id);

    // Get all attendance records for students in this batch
    const studentIds = batch.studentIds.map((s) => s._id);
    const attendance = await Attendance.find({
      studentId: { $in: studentIds },
      classId: { $in: classIds },
      tenantId,
      isProgressOnly: { $ne: true },
    });

    // Build summary
    const summary = batch.studentIds.map((student) => {
      const studentAttendance = attendance.filter(
        (a) => String(a.studentId) === String(student._id)
      );
      const presentCount = studentAttendance.filter((a) => a.present).length;
      const totalClasses = classes.length;
      const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

      return {
        studentId: student._id,
        studentName: student.userId.name,
        studentEmail: student.userId.email,
        totalClasses,
        presentCount,
        absentCount: totalClasses - presentCount,
        attendancePercentage: attendancePercentage.toFixed(2),
      };
    });

    res.status(200).json({
      batchId,
      batchName: batch.name,
      totalStudents: batch.studentIds.length,
      totalClasses: classes.length,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance summary",
      error: error.message,
    });
  }
};

// Update attendance record (in case of corrections)
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { present, notes } = req.body;
    const tenantId = req.user.tenantId;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (String(attendance.tenantId) !== String(tenantId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    attendance.present = Boolean(present);
    attendance.notes = notes || "";
    attendance.markedAt = new Date();

    await attendance.save();

    res.status(200).json({
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating attendance",
      error: error.message,
    });
  }
};

// Mark attendance when student watches ≥75% of a class video
export const markVideoAttendance = async (req, res) => {
  try {
    const { classId } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    // Find student profile
    const student = await Student.findOne({ userId, tenantId }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Verify class exists
    const classRecord = await Class.findOne({ _id: classId, tenantId });
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Only allow attendance marking after class is completed
    if (classRecord.status !== "completed") {
      return res.status(400).json({
        message: "Attendance can only be marked after the class is completed",
      });
    }

    // Verify student belongs to the batch
    const batch = await Batch.findById(classRecord.batchId).select("studentIds");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const studentInBatch = batch.studentIds.some(
      (id) => String(id) === String(student._id)
    );
    if (!studentInBatch) {
      return res.status(403).json({ message: "You are not enrolled in this class" });
    }

    // Check if already marked present
    const existing = await Attendance.findOne({
      classId,
      studentId: student._id,
      tenantId,
    });

    if (existing && existing.present) {
      return res.status(200).json({
        message: "Attendance already marked as present",
        alreadyPresent: true,
        attendance: {
          _id: existing._id,
          classId: existing.classId,
          present: existing.present,
        },
      });
    }

    // Upsert attendance as present (no videoProgress here — stored in VideoProgress model)
    const attendance = await Attendance.findOneAndUpdate(
      { classId, studentId: student._id, tenantId },
      {
        tenantId,
        classId,
        studentId: student._id,
        tutorId: classRecord.teacherId,
        present: true,
        isProgressOnly: false,
        presenceSource: "system",
        trackingProvider: "video",
        notes: "Auto-marked: 75% video watched",
        markedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Attendance marked as present via video progress",
      alreadyPresent: false,
      attendance: {
        _id: attendance._id,
        classId: attendance.classId,
        present: attendance.present,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error marking video attendance",
      error: error.message,
    });
  }
};

// Fetch video progress for the logged in student
export const getMyVideoProgress = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    const student = await Student.findOne({ userId, tenantId }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const progressRecords = await VideoProgress.find({
      studentId: student._id,
      tenantId,
    }).sort({ updatedAt: -1 });

    // Also check if attendance was marked for these classes
    const classIds = progressRecords.map((r) => r.classId);
    const attendanceRecords = await Attendance.find({
      studentId: student._id,
      tenantId,
      classId: { $in: classIds },
      isProgressOnly: { $ne: true },
    }).select("classId present markedAt");

    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[String(record.classId)] = {
        present: record.present,
        markedAt: record.markedAt,
      };
      return acc;
    }, {});

    return res.status(200).json({
      student: student._id,
      progress: progressRecords.map((record) => {
        const plain = record.toObject();
        const classIdStr = String(plain.classId);
        const att = attendanceMap[classIdStr];
        return {
          _id: plain._id,
          classId: classIdStr,
          videos: plain.videos || {},
          maxProgress: plain.maxProgress || 0,
          attendanceMarked: Boolean(att?.present),
          markedAt: att?.markedAt || null,
          updatedAt: plain.updatedAt,
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching video progress",
      error: error.message,
    });
  }
};

// Save per-video progress for the logged in student
export const upsertMyVideoProgress = async (req, res) => {
  try {
    const { classId, videoKey, percent, attendanceMarked } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.id || req.user._id;

    if (!classId || !videoKey || typeof percent !== "number") {
      return res.status(400).json({
        message: "classId, videoKey, and percent are required",
      });
    }

    const student = await Student.findOne({ userId, tenantId }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const classRecord = await Class.findOne({ _id: classId, tenantId }).select("_id batchId teacherId");
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }

    const batch = await Batch.findById(classRecord.batchId).select("studentIds");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const studentInBatch = batch.studentIds.some((id) => String(id) === String(student._id));
    if (!studentInBatch) {
      return res.status(403).json({ message: "You are not enrolled in this class" });
    }

    // Find existing progress in the new VideoProgress model
    const existing = await VideoProgress.findOne({
      classId,
      studentId: student._id,
      tenantId,
    });

    const existingVideos = existing?.videos
      ? JSON.parse(JSON.stringify(existing.videos))
      : {};
    const currentVideoPercent = Number(existingVideos[videoKey] || 0);
    const nextPercent = Math.max(0, Math.min(100, Number(percent) || 0));

    if (nextPercent > currentVideoPercent) {
      existingVideos[videoKey] = nextPercent;
    }

    const maxProgress = Math.max(0, ...Object.values(existingVideos).map((value) => Number(value) || 0));

    // Upsert into VideoProgress model
    const progressDoc = await VideoProgress.findOneAndUpdate(
      { classId, studentId: student._id, tenantId },
      {
        classId,
        studentId: student._id,
        tenantId,
        videos: existingVideos,
        maxProgress,
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Check attendance status
    const attendance = await Attendance.findOne({
      classId,
      studentId: student._id,
      tenantId,
      isProgressOnly: { $ne: true },
    }).select("present markedAt");

    return res.status(200).json({
      message: "Video progress saved",
      progress: {
        _id: progressDoc._id,
        classId: String(progressDoc.classId),
        videos: progressDoc.videos || {},
        maxProgress: progressDoc.maxProgress || 0,
        attendanceMarked: Boolean(attendance?.present),
        markedAt: attendance?.markedAt || null,
        updatedAt: progressDoc.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error saving video progress",
      error: error.message,
    });
  }
};
