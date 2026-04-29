import mongoose from "mongoose";

const doubtMessageSchema = new mongoose.Schema(
  {
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["student", "tutor", "tenant"],
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    screenshots: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const classDoubtSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    messages: {
      type: [doubtMessageSchema],
      default: [],
    },
    doubtStatus: {
      type: String,
      enum: ["pending", "solved"],
      default: "pending",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastSolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Changed: unique per class + tenant + student (individual conversations)
classDoubtSchema.index({ classId: 1, tenantId: 1, studentId: 1 }, { unique: true });

export const ClassDoubt = mongoose.model("ClassDoubt", classDoubtSchema);
