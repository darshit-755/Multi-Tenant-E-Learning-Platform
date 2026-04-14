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
      enum: ["student", "tutor"],
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
    messages: {
      type: [doubtMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

classDoubtSchema.index({ classId: 1, tenantId: 1 }, { unique: true });

export const ClassDoubt = mongoose.model("ClassDoubt", classDoubtSchema);
