import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tutorSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subjects: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Tutor = model("Tutor", tutorSchema);