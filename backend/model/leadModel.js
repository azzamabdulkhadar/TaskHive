const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    alternatePhone: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["visit", "meeting", "enquiry", "delivery", "others"],
      default: "others",
    },
    source: {
      type: String,
      enum: ["website", "referral", "social", "direct", "email", "phone", "others"],
      default: "others",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "archived"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    tags: [{ type: String, trim: true }],
    description: { type: String, default: "" },
    visitReason: { type: String, default: "" },
    lastContactedAt: Date,
    nextFollowUpAt: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, nextFollowUpAt: 1 });
leadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
