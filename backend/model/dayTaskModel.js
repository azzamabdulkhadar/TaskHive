const mongoose = require("mongoose");

const dayTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    type: {
      type: String,
      enum: ["task", "meeting", "visit", "personal", "followup", "reminder"],
      default: "task",
    },
    startAt: { type: Date, required: true },
    durationMin: { type: Number, min: 0, default: 0 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    done: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "done", "skipped"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

dayTaskSchema.index({ user: 1, startAt: 1 });

module.exports = mongoose.model("DayTask", dayTaskSchema);
