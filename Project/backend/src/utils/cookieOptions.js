const isSecure = () =>
  process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";

const getSameSite = () =>
  isSecure() ? "none" : "lax";
// Production (cross-origin) → "none" ✅
// Development (localhost) → "lax" ✅

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: getSameSite(),
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: getSameSite(),
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: getSameSite(),
};