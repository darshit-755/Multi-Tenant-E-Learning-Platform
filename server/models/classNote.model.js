import mongoose from "mongoose";

const classNoteSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Class Note",
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    pdfs: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

classNoteSchema.index({ classId: 1, tenantId: 1, createdAt: -1 });

export const ClassNote = mongoose.model("ClassNote", classNoteSchema);
