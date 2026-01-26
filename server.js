import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

/**
 * 🔥 REQUIRED when running behind Vercel / proxies / load balancers
 */
app.set("trust proxy", true);

/* ============================
   GLOBAL MIDDLEWARE
============================ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

app.use(hpp());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

/* ============================
   RATE LIMITING (CLEAN & SAFE)
============================ */

const rateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
};

const globalLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
});

const authLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, try again later.",
});

app.use(globalLimiter);

/* ============================
   ROOT, HEALTH & FAVICON
============================ */

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "PrimeHealth API is running 🚀",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/favicon.png", (_req, res) => {
  res.status(204).end();
});

/* ============================
   ROUTES
============================ */

app.use("/api/auth", authLimiter, authRoutes);

/* ============================
   GLOBAL ERROR HANDLER
============================ */

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

/* ============================
   DATABASE & SERVER
============================ */

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Shutting down...");
      await mongoose.connection.close();
      server.close(() => process.exit(0));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
