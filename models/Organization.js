import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["HOSPITAL", "CLINIC", "SOLO_PRACTICE"],
      default: "CLINIC",
    },

    adminFullName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
