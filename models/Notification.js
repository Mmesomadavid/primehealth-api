import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  type: { type: String, enum: ["INFO", "WARNING", "ALERT"], default: "INFO" },
  title: { type: String, required: true },
  message: { type: String, required: true },

  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
