import { Class } from "../models/class.model.js";
import { Tutor } from "../models/tutor.model.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Subject } from "../models/subject.model.js";
import { Batch } from "../models/batch.model.js";
import { Attendance } from "../models/attendance.model.js";
import { ClassDoubt } from "../models/classDoubt.model.js";
import { sendTenantMail } from "../services/mail/mail.service.js";
import { MAIL_TYPES } from "../services/mail/mail.constant.js";

const dummyEmail = "voltix755@gmail.com";

const buildScheduleText = (startTime, duration) => {
  return `${startTime || ""} (${Number(duration) || 0} mins)`;
};

const populateClassQuery = (query) => {
  return query
    .populate("subjectId", "name status")
    .populate({
      path: "teacherId",
      populate: { path: "userId", select: "name email" },
    })
    .populate({
      path: "batchId",
      populate: {
        path: "studentIds",
        populate: { path: "userId", select: "name email" },
      },
    });
};

// Create a new class (tenant only)
export const createClass = async (req, res) => {
  try {
    const {
      teacherId,
      subjectId,
      batchId,
      topic,
      date,
      startTime,
      duration,
      videoProvider,
      videoLink,
      meetingId,
      calendarEventId,
      videoId,
      privacy,
      reminderTime,
      status,
    } = req.body;

    const tenantId = req.user.tenantId;

    if (!teacherId || !subjectId || !batchId || !date || !startTime || !duration) {
      return res.status(400).json({
        message:
          "teacherId, subjectId, batchId, date, startTime and duration are required",
      });
    }

    const parsedDuration = Number(duration);
    if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ message: "duration must be a positive number" });
    }

    const teacher = await Tutor.findOne({ _id: teacherId, tenantId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found in your institute" });
    }

    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found in your institute" });
    }

    const batch = await Batch.findOne({ _id: batchId, tenantId }).populate({
      path: "studentIds",
      populate: { path: "userId", select: "name email" },
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found in your institute" });
    }

    if (String(batch.teacherId) !== String(teacherId)) {
      return res.status(400).json({
        message: "Selected teacher does not belong to the selected batch",
      });
    }

    if (String(batch.subjectId) !== String(subjectId)) {
      return res.status(400).json({
        message: "Selected subject does not belong to the selected batch",
      });
    }

    if (["gmeet", "zoom"].includes(videoProvider) && !videoLink) {
      return res.status(400).json({
        message: "videoLink is required when videoProvider is gmeet or zoom",
      });
    }

    const newClass = await Class.create({
      tenantId,
      teacherId,
      subjectId,
      batchId,
      topic,
      date,
      startTime,
      duration: parsedDuration,
      videoProvider: videoProvider || "manual",
      videoLink: videoLink || "",
      meetingId: meetingId || "",
      calendarEventId: calendarEventId || "",
      videoId: videoId || "",
      privacy,
      reminderTime: reminderTime ?? 0,
      status: status || "scheduled",
    });

    const teacherUser = await User.findById(teacher.userId).select("name email");
    const scheduleTime = buildScheduleText(newClass.startTime, newClass.duration);
    const className = newClass.topic || "Class Session";

    if (teacherUser) {
      await sendTenantMail(MAIL_TYPES.CLASS_ASSIGNED_TUTOR, {
        name: teacherUser.name,
        email: dummyEmail,
        className,
        subject: subject.name,
        scheduleDays: newClass.date,
        scheduleTime,
        meetLink: newClass.videoLink || "",
      });
    }

    if (batch.studentIds?.length > 0) {
      await Promise.all(
        batch.studentIds
          .map((studentProfile) => studentProfile?.userId)
          .filter(Boolean)
          .map((studentUser) =>
            sendTenantMail(MAIL_TYPES.CLASS_ASSIGNED_STUDENT, {
              name: studentUser.name,
              email: dummyEmail,
              className,
              subject: subject.name,
              scheduleDays: newClass.date,
              scheduleTime,
              meetLink: newClass.videoLink || "",
            })
          )
      );
    }

    const populatedClass = await populateClassQuery(Class.findById(newClass._id));

    return res.status(201).json({
      message: "Class created successfully",
      class: populatedClass,
    });
  } catch (error) {
    console.error("Create Class Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all classes for a tenant
export const getClassesByTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const classes = await populateClassQuery(
      Class.find({ tenantId }).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      message: "Classes fetched successfully",
      classes,
    });
  } catch (error) {
    console.error("Get Classes Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Update a class
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const {
      teacherId,
      subjectId,
      batchId,
      topic,
      date,
      startTime,
      duration,
      videoProvider,
      videoLink,
      meetingId,
      calendarEventId,
      videoId,
      privacy,
      reminderTime,
      status,
    } = req.body;

    const tenantId = req.user.tenantId;

    const classDoc = await Class.findOne({ _id: classId, tenantId });
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const nextTeacherId = teacherId || classDoc.teacherId;
    const nextSubjectId = subjectId || classDoc.subjectId;
    const nextBatchId = batchId || classDoc.batchId;

    const teacher = await Tutor.findOne({ _id: nextTeacherId, tenantId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found in your institute" });
    }

    const subject = await Subject.findOne({ _id: nextSubjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found in your institute" });
    }

    const batch = await Batch.findOne({ _id: nextBatchId, tenantId }).populate({
      path: "studentIds",
      populate: { path: "userId", select: "name email" },
    });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found in your institute" });
    }

    if (String(batch.teacherId) !== String(nextTeacherId)) {
      return res.status(400).json({
        message: "Selected teacher does not belong to the selected batch",
      });
    }

    if (String(batch.subjectId) !== String(nextSubjectId)) {
      return res.status(400).json({
        message: "Selected subject does not belong to the selected batch",
      });
    }

    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ message: "duration must be a positive number" });
      }
      classDoc.duration = parsedDuration;
    }

    const nextVideoProvider =
      videoProvider !== undefined ? videoProvider : classDoc.videoProvider;
    const nextVideoLink = videoLink !== undefined ? videoLink : classDoc.videoLink;

    if (["gmeet", "zoom"].includes(nextVideoProvider) && !nextVideoLink) {
      return res.status(400).json({
        message: "videoLink is required when videoProvider is gmeet or zoom",
      });
    }

    if (teacherId !== undefined) classDoc.teacherId = teacherId;
    if (subjectId !== undefined) classDoc.subjectId = subjectId;
    if (batchId !== undefined) classDoc.batchId = batchId;
    if (topic !== undefined) classDoc.topic = topic;
    if (date !== undefined) classDoc.date = date;
    if (startTime !== undefined) classDoc.startTime = startTime;
    if (videoProvider !== undefined) classDoc.videoProvider = videoProvider;
    if (videoLink !== undefined) classDoc.videoLink = videoLink;
    if (meetingId !== undefined) classDoc.meetingId = meetingId;
    if (calendarEventId !== undefined) classDoc.calendarEventId = calendarEventId;
    if (videoId !== undefined) classDoc.videoId = videoId;
    if (privacy !== undefined) classDoc.privacy = privacy;
    if (reminderTime !== undefined) classDoc.reminderTime = Number(reminderTime);
    if (status !== undefined) classDoc.status = status;

    await classDoc.save();

    const teacherUser = await User.findById(teacher.userId).select("name email");
    const scheduleTime = buildScheduleText(classDoc.startTime, classDoc.duration);
    const className = classDoc.topic || "Class Session";

    if (teacherUser) {
      await sendTenantMail(MAIL_TYPES.CLASS_ASSIGNED_TUTOR, {
        name: teacherUser.name,
        email: dummyEmail,
        className,
        subject: subject.name,
        scheduleDays: classDoc.date,
        scheduleTime,
        meetLink: classDoc.videoLink || "",
      });
    }

    if (batch.studentIds?.length > 0) {
      await Promise.all(
        batch.studentIds
          .map((studentProfile) => studentProfile?.userId)
          .filter(Boolean)
          .map((studentUser) =>
            sendTenantMail(MAIL_TYPES.CLASS_ASSIGNED_STUDENT, {
              name: studentUser.name,
              email: dummyEmail,
              className,
              subject: subject.name,
              scheduleDays: classDoc.date,
              scheduleTime,
              meetLink: classDoc.videoLink || "",
            })
          )
      );
    }

    const populatedClass = await populateClassQuery(Class.findById(classDoc._id));

    return res.status(200).json({
      message: "Class updated successfully",
      class: populatedClass,
    });
  } catch (error) {
    console.error("Update Class Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete a class
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const tenantId = req.user.tenantId;

    const classDoc = await Class.findOneAndDelete({ _id: classId, tenantId });
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    return res.status(200).json({
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete Class Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get classes for a specific tutor
export const getClassesByTutor = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    const tutorProfile = await Tutor.findOne({ userId, tenantId });
    if (!tutorProfile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    const classes = await populateClassQuery(
      Class.find({ teacherId: tutorProfile._id, tenantId }).sort({ createdAt: -1 })
    );

    const classIds = classes.map((classDoc) => classDoc._id);
    const attendedClassIds = await Attendance.distinct("classId", {
      tenantId,
      classId: { $in: classIds },
    });
    const attendedClassSet = new Set(attendedClassIds.map((id) => String(id)));

    const doubtsByClass = await ClassDoubt.aggregate([
      {
        $match: {
          tenantId: tutorProfile.tenantId,
          classId: { $in: classIds },
        },
      },
      {
        $project: {
          classId: 1,
          doubtStatus: 1,
          threadDoubtCount: {
            $size: {
              $filter: {
                input: "$messages",
                as: "msg",
                cond: {
                  $and: [
                    { $eq: ["$$msg.senderRole", "student"] },
                    { $ne: ["$$msg.text", "Doubt Solved"] },
                    {
                      $or: [
                        { $eq: [{ $ifNull: ["$lastSolvedAt", null] }, null] },
                        { $gt: ["$$msg.createdAt", "$lastSolvedAt"] },
                      ],
                    },
                  ],
                },
              },
            },
          },
          lastDoubtAt: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: "$messages",
                    as: "msg",
                    cond: {
                      $and: [
                        { $eq: ["$$msg.senderRole", "student"] },
                        { $ne: ["$$msg.text", "Doubt Solved"] },
                      ],
                    },
                  },
                },
                as: "m",
                in: "$$m.createdAt",
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$classId",
          doubtCount: { $sum: "$threadDoubtCount" },
          lastDoubtAt: { $max: "$lastDoubtAt" },
          // Count how many threads have pending status
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$doubtStatus", "pending"] }, 1, 0] },
          },
          totalThreads: { $sum: 1 },
        },
      },
    ]);

    const doubtCountMap = new Map(
      doubtsByClass.map((item) => [String(item._id), Number(item.doubtCount) || 0])
    );
    const lastDoubtAtMap = new Map(
      doubtsByClass.map((item) => [String(item._id), item.lastDoubtAt || null])
    );
    const doubtStatusMap = new Map(
      doubtsByClass.map((item) => [
        String(item._id),
        // Show "solved" only if all threads are solved (no pending)
        item.pendingCount === 0 && item.totalThreads > 0 ? "solved" : "pending",
      ])
    );

    const classesWithAttendance = classes.map((classDoc) => ({
      ...classDoc.toObject(),
      hasAttendance: attendedClassSet.has(String(classDoc._id)),
      doubtCount: doubtCountMap.get(String(classDoc._id)) || 0,
      lastDoubtAt: lastDoubtAtMap.get(String(classDoc._id)) || null,
      hasDoubts: (doubtCountMap.get(String(classDoc._id)) || 0) > 0,
      doubtStatus: doubtStatusMap.get(String(classDoc._id)) || "pending",
    }));

    return res.status(200).json({
      message: "Classes fetched successfully",
      classes: classesWithAttendance,
    });
  } catch (error) {
    console.error("Get Tutor Classes Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get classes for a specific student
export const getClassesByStudent = async (req, res) => {
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
    }).select("_id");

    const batchIds = batches.map((batch) => batch._id);

    const classes = await populateClassQuery(
      Class.find({
        tenantId,
        batchId: { $in: batchIds },
      }).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      message: "Classes fetched successfully",
      classes,
    });
  } catch (error) {
    console.error("Get Student Classes Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
