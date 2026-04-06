// src/models/user.model.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    role: {
      type: String,
      enum: ["superadmin", "tenant", "tutor", "student"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "inactive"],
      default: "inactive",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    
    onlineStatus: {
      type: Boolean,
      default: false
    },
    profileImage : {
      type : String,
      default : ""
    }
  },
  { timestamps: true }
);

export const User = model("User", userSchema);