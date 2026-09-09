import express            from "express";
import cors               from "cors";
import cookieParser       from "cookie-parser";
import helmet             from "helmet";
import rateLimit          from "express-rate-limit";
import { requestLogger }  from "./middlewares/logger.middleware.js";

// ── Rate limiters ────────────────────────────────────────────────────────────

const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 min
  limit:          300,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { statusCode: 429, message: "Too many requests, please try again later.", success: false },
});

const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  limit:          20,              // tighter for auth
  standardHeaders: true,
  legacyHeaders:  false,
  message: { statusCode: 429, message: "Too many attempts. Please try again later.", success: false },
});

// ── App ──────────────────────────────────────────────────────────────────────

const app = express();

// Trust Railway's reverse proxy so req.secure and cookies with Secure flag work
app.set("trust proxy", 1);

// ── CORS ─────────────────────────────────────────────────────────────────────

// Always include the known production frontend + localhost variants.
// Additional origins can be injected via CORS_ORIGIN (comma-separated).
const builtInOrigins = [
  "https://vidtube-frontend-ochre.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...builtInOrigins, ...envOrigins])];

// Allow all Vercel preview-deployment subdomains automatically
const vercelPreviewRe = /^https:\/\/[\w-]+\.vercel\.app$/i;

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || vercelPreviewRe.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials:    true,   // MUST be true so cookies travel cross-origin
    methods:        ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge:         86400,  // cache preflight 24 h
  })
);

// ── Security headers ─────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary embeds
  })
);

// ── Body / Cookie parsers ────────────────────────────────────────────────────

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Request logger (dev only — see logger.middleware.js) ─────────────────────

app.use(requestLogger);

// ── Health check (unauthenticated, before rate limiting) ─────────────────────

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    env:    process.env.NODE_ENV || "development",
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────

import userRouter         from "./routes/user.routes.js";
import videoRouter        from "./routes/video.routes.js";
import likeRouter         from "./routes/like.routes.js";
import commentRouter      from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter     from "./routes/playlist.routes.js";
import tweetRouter        from "./routes/tweet.routes.js";
import dashboardRouter    from "./routes/dashboard.routes.js";
import { errorHandler }   from "./middlewares/errorHandler.middleware.js";

// Apply general rate limit to all API routes
app.use("/api/v1", generalLimiter);

// Stricter limits on login / register
app.use("/api/v1/users/login",    authLimiter);
app.use("/api/v1/users/register", authLimiter);

app.use("/api/v1/users",          userRouter);
app.use("/api/v1/videos",         videoRouter);
app.use("/api/v1/likes",          likeRouter);
app.use("/api/v1/comments",       commentRouter);
app.use("/api/v1/subscriptions",  subscriptionRouter);
app.use("/api/v1/playlists",      playlistRouter);
app.use("/api/v1/tweets",         tweetRouter);
app.use("/api/v1/dashboard",      dashboardRouter);

// 404 for unknown API routes
app.use("/api/v1", (_req, res) => {
  res.status(404).json({
    statusCode: 404,
    message:    "API endpoint not found",
    success:    false,
  });
});

// Global error handler (always last)
app.use(errorHandler);

export { app };
