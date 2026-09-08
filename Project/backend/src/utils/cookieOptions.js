const isProd = process.env.NODE_ENV === "production" || 
               process.env.COOKIE_SECURE === "true";

// Hardcode production values — no env dependency!
export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,        // Always true — Railway is HTTPS
  sameSite: "none",    // Always none — cross-origin
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};