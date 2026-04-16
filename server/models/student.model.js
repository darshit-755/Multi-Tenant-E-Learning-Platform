import mongoose from "mongoose";
import { INDIAN_MOBILE_NUMBER_REGEX } from "../utils/phone.js";

const { Schema, model } = mongoose;

const studentSchema = new Schema(
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
    rollNumber: {
      type: String,
      trim: true,
    },
    classLevel: {
      type: String,
      trim: true,
    },
    board: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [
        INDIAN_MOBILE_NUMBER_REGEX,
        "Phone must be a valid 10-digit Indian mobile number",
      ],
    },
    parentName: {
      type: String,
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

export const Student = model("Student", studentSchema);