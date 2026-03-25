// src/models/ProctoringSnapshot.ts
import { Schema, model, models } from "mongoose";

const ProctoringSnapshotSchema = new Schema(
  {
    examSessionId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    capturedAt: {
      type: Date,
      required: true,
    },
    faceCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["OK", "WARNING", "SUSPICIOUS", "CAPTURED"],
      default: "CAPTURED",
    },
    detectionConfidence: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "proctoring_snapshots",
  },
);

export const ProctoringSnapshot =
  models.ProctoringSnapshot ||
  model("ProctoringSnapshot", ProctoringSnapshotSchema);
