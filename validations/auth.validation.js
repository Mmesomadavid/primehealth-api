import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["OWNER", "DOCTOR", "PATIENT"]),
  organization: z.object({
    name: z.string().min(2),
    type: z.enum(["HOSPITAL", "CLINIC", "SOLO_PRACTICE"]),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});
