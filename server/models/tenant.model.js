// src/models/tenant.model.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "inactive"],
      default: "inactive",
    },

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    statusChangedOnce: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export  const Tenant = model("Tenant", tenantSchema);