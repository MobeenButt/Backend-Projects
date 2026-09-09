// Request Logger Middleware
// Logs are only written in development; in production only errors are logged.

const isDev = process.env.NODE_ENV !== "production";

// Fields that must NEVER appear in logs
const REDACTED_FIELDS = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "refreshToken",
  "accessToken",
  "token",
  "secret",
  "authorization",
]);

const redact = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACTED_FIELDS.has(k.toLowerCase()) ? "[REDACTED]" : v;
  }
  return out;
};

export const requestLogger = (req, res, next) => {
  // Production: skip all request logging to protect PII and reduce noise
  if (!isDev) {
    return next();
  }

  const startTime = Date.now();

  console.log("\n" + "=".repeat(60));
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  console.log(`⏰ ${new Date().toLocaleString()}  🌐 IP: ${req.ip}`);
  console.log(`🔑 User: ${req.user?.username || "Not authenticated"}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Body:", JSON.stringify(redact(req.body), null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("🔍 Query:", req.query);
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.log("🎯 Params:", req.params);
  }

  // Capture response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    console.log(`📤 Status: ${res.statusCode}  ⏱ ${duration}ms`);
    if (res.statusCode >= 400) {
      console.log("❌ Error Response:", data);
    } else {
      console.log("✅ Success");
    }
    console.log("=".repeat(60) + "\n");
    return originalJson(data);
  };

  next();
};
