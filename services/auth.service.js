import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Organization from "../models/Organization.js";
import { generateOtp } from "./otp.service.js";

/* ============================
   REGISTER USER
============================ */

export const registerUser = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userRole,
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      password,
      adminFullName,
    } = payload;

    // DEBUG: show payload
    console.log("REGISTER PAYLOAD:", payload);
    console.log("PASSWORD TYPE:", typeof password);

    // VALIDATION
    if (!email || !password || !userRole) {
      throw new Error("Email, password, and role are required");
    }

    if (typeof password !== "string") {
      throw new Error("Password must be a string");
    }

    if (!["organization", "doctor"].includes(userRole)) {
      throw new Error("Invalid role");
    }

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // HASH PASSWORD
    const passwordHash = await bcrypt.hash(password, 12);

    let organization;
    const role = userRole === "doctor" ? "DOCTOR" : "OWNER";

    // OWNER REGISTRATION
    if (role === "OWNER") {
      if (!adminFullName) {
        throw new Error("Admin full name is required");
      }

      const org = await Organization.create(
        [
          {
            name: `${adminFullName}'s Organization`,
            adminFullName,
          },
        ],
        { session }
      );

      organization = org[0];
    }

    // DOCTOR REGISTRATION
    if (role === "DOCTOR") {
      organization = await Organization.findOne().session(session);
      if (!organization) {
        throw new Error("No organization available");
      }
    }

    // CREATE USER
    const user = await User.create(
      [
        {
          email,
          passwordHash,
          role,
          organizationId: organization._id,
          firstName,
          lastName,
          phone,
          countryCode,
          isEmailVerified: false,
        },
      ],
      { session }
    );

    // CREATE DOCTOR PROFILE
    if (role === "DOCTOR") {
      await Doctor.create(
        [
          {
            userId: user[0]._id,
            organizationId: organization._id,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // SEND OTP AFTER COMMIT
    await generateOtp(email);

    return {
      userId: user[0]._id,
      role: user[0].role,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ============================
   LOGIN USER
============================ */

export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new Error("Email not verified");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign(
    {
      sub: user._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken };
};
