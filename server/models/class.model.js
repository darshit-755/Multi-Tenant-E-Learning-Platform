import mongoose from "mongoose";

const { Schema, model } = mongoose;

const classSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    topic: {
      type: String,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    videoProvider: {
      type: String,
      enum: ["manual", "gmeet", "zoom", "youtube"],
      default: "manual",
    },

    videoLink: {
      type: String,
    },

    meetingId: {
      type: String,
    },

    calendarEventId: {
      type: String,
    },

    videoId: {
      type: String,
    },

    privacy: {
      type: String,
      enum: ["public", "private", "unlisted"],
    },

    reminderTime: {
      type: Number,
      enum: [0, 10, 30, 60],
      default: 0,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export const Class = model("Class", classSchema);