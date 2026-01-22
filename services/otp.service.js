import crypto from "crypto";
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "./email.service.js"; // <-- Email service

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const generateOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Remove old OTPs for this email
  await Otp.deleteMany({ email });

  // Save OTP to DB
  await Otp.create({
    email,
    otpHash,
    code: otp, // <-- Save the OTP code
    expiresAt,
  });

  // Send OTP via email
  await sendOtpEmail(email, otp);

  // For debugging (optional)
  console.log(`OTP for ${email}: ${otp}`);

  return true;
};

export const verifyOtp = async (email, otp) => {
  const otpHash = hashOtp(otp);

  const record = await Otp.findOne({
    email,
    otpHash,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return false;

  await Otp.deleteMany({ email });
  return true;
};
