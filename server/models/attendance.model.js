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
    markedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per student per class
attendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });

export const Attendance = model("Attendance", attendanceSchema);
