import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  action: { type: String, required: true },
  details: { type: String },

  ipAddress: { type: String },
  userAgent: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
