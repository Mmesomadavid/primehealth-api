import User from "../models/User.js";
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";
import { verifyOtp as verifyOtpService } from "../services/otp.service.js";

/**
 * Register user (Doctor or Organization Owner)
 * Sends OTP on success
 */
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      message: "OTP sent to email",
      data: result,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);

    return res.status(400).json({
      error: err.message || "Registration failed",
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const tokens = await loginUser(email, password);

    return res.status(200).json(tokens);
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);

    return res.status(400).json({
      error: err.message || "Login failed",
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const valid = await verifyOtpService(email, otp);

    if (!valid) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    await User.updateOne(
      { email },
      { isEmailVerified: true }
    );

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err.message);

    return res.status(400).json({
      error: err.message || "OTP verification failed",
    });
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    await generateOtp(email);

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err.message);

    return res.status(400).json({
      error: err.message || "Resend OTP failed",
    });
  }
};



/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
