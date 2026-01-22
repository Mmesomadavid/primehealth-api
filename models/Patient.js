import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },

  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
  address: { type: String },

  medicalHistory: [{
    condition: { type: String },
    diagnosisDate: { type: Date },
    status: { type: String, enum: ["ACTIVE", "RESOLVED"] },
    notes: { type: String },
    medications: [{ type: String }],
    allergies: [{ type: String }],
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Patient", patientSchema);
