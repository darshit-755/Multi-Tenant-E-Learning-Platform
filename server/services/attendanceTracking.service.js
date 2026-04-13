import { Attendance } from "../models/attendance.model.js";
import { Class } from "../models/class.model.js";

const SYSTEM_SOURCES = new Set(["client", "webhook", "system"]);

const asDate = (value) => {
  if (!value) return new Date();
  const candidate = new Date(value);
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
};

const computePresenceSource = (currentSource, incomingSource) => {
  const existing = currentSource || "manual";

  if (existing === incomingSource) {
    return existing;
  }

  return "hybrid";
};

export const recordAttendanceEvent = async ({
  tenantId,
  classId,
  studentId,
  tutorId,
  provider,
  action,
  occurredAt,
  source = "system",
  metadata = {},
}) => {
  if (!["join", "leave"].includes(action)) {
    throw new Error("Invalid attendance action");
  }

  const eventTime = asDate(occurredAt);
  const classRecord = await Class.findOne({ _id: classId, tenantId }).select(
    "_id tenantId teacherId videoProvider duration"
  );

  if (!classRecord) {
    throw new Error("Class not found");
  }

  const classDurationMinutes = Math.max(1, Number(classRecord.duration) || 1);
  const presentThresholdMinutes = Math.max(1, Math.ceil(classDurationMinutes / 2));

  const trackingSource = SYSTEM_SOURCES.has(source) ? "system" : "manual";

  let attendance = await Attendance.findOne({
    tenantId,
    classId: classRecord._id,
    studentId,
  });

  if (!attendance) {
    attendance = new Attendance({
      tenantId,
      classId: classRecord._id,
      studentId,
      tutorId: tutorId || classRecord.teacherId,
      presenceSource: trackingSource,
      trackingProvider: provider || classRecord.videoProvider || "manual",
      notes: "",
      present: false,
    });
  }

  const wasPresent = Boolean(attendance.present);

  attendance.tutorId = attendance.tutorId || tutorId || classRecord.teacherId;
  attendance.markedAt = new Date();
  attendance.trackingProvider = provider || classRecord.videoProvider || "manual";
  attendance.presenceSource = computePresenceSource(
    attendance.presenceSource,
    trackingSource
  );
  attendance.lastEventAt = eventTime;

  if (action === "join") {
    attendance.joinCount = (attendance.joinCount || 0) + 1;
    if (!attendance.firstJoinAt || eventTime < attendance.firstJoinAt) {
      attendance.firstJoinAt = eventTime;
    }
    attendance.lastJoinAt = eventTime;
  }

  if (action === "leave") {
    const previousJoin = attendance.lastJoinAt ? new Date(attendance.lastJoinAt) : null;
    const previousLeave = attendance.lastLeaveAt ? new Date(attendance.lastLeaveAt) : null;

    attendance.leaveCount = (attendance.leaveCount || 0) + 1;
    attendance.lastLeaveAt = eventTime;

    const hasOpenJoinWindow =
      previousJoin &&
      (!previousLeave || previousJoin.getTime() > previousLeave.getTime());

    if (
      hasOpenJoinWindow &&
      eventTime.getTime() > previousJoin.getTime()
    ) {
      const elapsedMs = eventTime.getTime() - previousJoin.getTime();
      const elapsedMinutes = Math.max(0, Math.round(elapsedMs / (1000 * 60)));
      attendance.totalDurationMinutes =
        (attendance.totalDurationMinutes || 0) + elapsedMinutes;
    }
  }

  const thresholdMet =
    (attendance.totalDurationMinutes || 0) >= presentThresholdMinutes;
  attendance.present = wasPresent || thresholdMet;

  const nextEvents = [
    ...(attendance.trackingEvents || []),
    {
      action,
      at: eventTime,
      source,
      meta: metadata,
    },
  ];

  attendance.trackingEvents = nextEvents.slice(-50);

  await attendance.save();

  return attendance;
};
