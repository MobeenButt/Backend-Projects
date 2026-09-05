// Centralized cookie options for auth tokens.
// In production (NODE_ENV=production or HTTPS) cookies are marked Secure.
// In development on localhost, Secure would block them, so we disable it.
const isSecure = () =>
  process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";

// Short-lived access token cookie config
export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// Long-lived refresh token cookie config
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

// Options for clearing cookies on logout
export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure(),
  sameSite: "lax",
};
