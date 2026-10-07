const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    category: { type: String, trim: true, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    color: { type: String, default: "#ffffff" },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    file: { type: String, default: "" }, // URL to uploaded attachment
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Index for fast user-scoped queries
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, isPinned: 1 });

module.exports = mongoose.model("Note", noteSchema);
