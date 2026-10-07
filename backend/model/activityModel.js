const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entityType: {
      type: String,
      enum: ["note", "event", "lead", "file", "auth"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityTitle: { type: String, default: "" },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN", "LOGOUT", "UPLOAD"],
      required: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
