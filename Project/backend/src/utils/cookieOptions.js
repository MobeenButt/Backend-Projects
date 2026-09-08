const isProd = process.env.NODE_ENV === "production";
// COOKIE_SECURE=true is an explicit override for staging/live HTTPS behind proxies
const forceSecure = process.env.COOKIE_SECURE === "true";

// Secure cookies are required for SameSite=None; they only work over HTTPS.
const secure = forceSecure || isProd;
const sameSite = secure ? "none" : "lax";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure,
  sameSite,
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure,
  sameSite,
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure,
  sameSite,
};