const isProd = process.env.NODE_ENV === "production" || 
               process.env.COOKIE_SECURE === "true";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};