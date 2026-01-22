import express from "express";
import { 
    register, 
    login, 
    verifyOtp,
    resendOtp,
    getCurrentUser
} from "../controllers/auth.controller.js";
import {protect, authenticate} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.get("/me", protect, authenticate, getCurrentUser);

export default router;
