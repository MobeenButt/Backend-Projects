import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { requestLogger } from "./middlewares/logger.middleware.js";

// Rate limiting: general API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // max 300 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many requests, please try again later.",
    success: false,
  },
});

// Stricter limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many attempts. Please try again later.",
    success: false,
  },
});

const app = express();

// CORS Configuration - Production Ready
// Defaults always include the production frontend + localhost, so cookies work
// even if CORS_ORIGIN env is unset or points to an old URL.
const allowedOrigins = [
  "https://vidtube-frontend-ochre.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

// Vercel preview deployments generate new subdomains on every push
// (e.g. vidtube-frontend-xxxx-username.vercel.app). Allow all *.vercel.app
// origins so the cookies (and thus tokens) keep working across deploys.
const vercelPreviewPattern = /^https:\/\/[\w-]+\.vercel\.app$/i;

// Custom CSRF-safe check: set-cookie headers are only allowed when the request
// origin matches, so credentials reflect the exact origin (never "*").
app.set("trust proxy", 1); // Trust first proxy (for secure cookies behind proxies/load balancers)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        vercelPreviewPattern.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn("❌ CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true, // CRITICAL: Allow cookies cross-origin
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours - cache preflight requests
  })
);

// Handle preflight OPTIONS requests explicitly
// Note: Express 5 doesn't support "*" - use regex or remove this line (cors middleware already handles OPTIONS)
// app.options("*", cors()); // Removed - cors middleware handles this automatically

// Security headers (helmet) - CSP tailored for serving static files only
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Major configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Request Logger (shows all API calls in terminal)
app.use(requestLogger);

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// API routes
app.use("/api/v1", generalLimiter);
app.use("/api/v1/users/login", authLimiter);
app.use("/api/v1/users/register", authLimiter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// 404 handler for unknown API routes
app.use("/api/v1", (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: "API endpoint not found",
    success: false,
  });
});

// Error handling middleware (sabse last mein hona chahiye)
app.use(errorHandler);

export { app };