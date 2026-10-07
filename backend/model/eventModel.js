const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, trim: true, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["upcoming", "in_progress", "completed", "cancelled"],
      default: "upcoming",
    },
    reminder: {
      type: String,
      enum: ["none", "at_time", "5min", "15min", "30min", "1hour", "1day"],
      default: "none",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

eventSchema.index({ user: 1, startDate: 1 });
eventSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
