// Cookie flags for cross-origin (Vercel → Railway) authentication.
//
// Rule: SameSite=None REQUIRES Secure=true.
// In production the backend is on Railway (HTTPS) and the frontend is on
// Vercel (HTTPS), so cookies MUST have Secure+SameSite=None to travel
// across the two different origins.
//
// Detection order:
//  1. COOKIE_SECURE=true  → always use secure/none  (explicit override, most reliable)
//  2. NODE_ENV=production → use secure/none
//  3. Otherwise           → development mode, use lax (works on localhost)

const isSecure =
  process.env.COOKIE_SECURE === "true" ||
  process.env.NODE_ENV === "production";

const sameSite = isSecure ? "none" : "lax";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure,
  sameSite,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure,
  sameSite,
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

// Used by clearCookie — must match the original set attributes exactly,
// otherwise the browser ignores the clear request.
export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure,
  sameSite,
};
