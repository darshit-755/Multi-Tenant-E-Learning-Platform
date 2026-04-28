import mongoose from "mongoose";

const { Schema, model } = mongoose;

const videoProgressSchema = new Schema(
  {
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
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    videos: {
      type: Schema.Types.Mixed,
      default: {},
    },
    maxProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// One progress record per student per class
videoProgressSchema.index({ classId: 1, studentId: 1, tenantId: 1 }, { unique: true });

export const VideoProgress = model("VideoProgress", videoProgressSchema);
