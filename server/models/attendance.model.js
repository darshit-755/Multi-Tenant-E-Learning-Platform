import mongoose from "mongoose";

const { Schema, model } = mongoose;

const attendanceSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    isProgressOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    presenceSource: {
      type: String,
      enum: ["manual", "system", "hybrid"],
      default: "manual",
    },
    trackingProvider: {
      type: String,
      enum: ["manual", "gmeet", "zoom", "video"],
      default: "manual",
    },
    videoProgress: {
      type: Schema.Types.Mixed,
      default: {},
    },
    videoMaxProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    firstJoinAt: {
      type: Date,
      default: null,
    },
    lastJoinAt: {
      type: Date,
      default: null,
    },
    lastLeaveAt: {
      type: Date,
      default: null,
    },
    lastEventAt: {
      type: Date,
      default: null,
    },
    joinCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    leaveCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    trackingEvents: [
      {
        action: {
          type: String,
          enum: ["join", "leave"],
          required: true,
        },
        at: {
          type: Date,
          required: true,
        },
        source: {
          type: String,
          enum: ["client", "webhook", "system", "manual"],
          default: "system",
        },
        meta: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per student per class
attendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });

export const Attendance = model("Attendance", attendanceSchema);
