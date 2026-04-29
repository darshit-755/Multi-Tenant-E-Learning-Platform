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
    contentType: {
      type: String,
      enum: ["note", "videoLecture"],
      default: "note",
      index: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    lectureLink: {
      type: String,
      trim: true,
      default: "",
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
    videos: {
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
    studentProgress: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
          index: true,
        },
        tenantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tenant",
          required: true,
          index: true,
        },
        videos: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        maxProgress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        attendanceMarked: {
          type: Boolean,
          default: false,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

classNoteSchema.index({ classId: 1, tenantId: 1, "studentProgress.studentId": 1 });
classNoteSchema.index({ classId: 1, tenantId: 1, createdAt: -1 });

export const ClassNote = mongoose.model("ClassNote", classNoteSchema);
