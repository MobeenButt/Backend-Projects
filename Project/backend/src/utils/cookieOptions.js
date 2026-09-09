// Cookie flags for cross-origin (Vercel → Railway) authentication.
//
// CRITICAL RULES for cross-origin cookies to work:
//  1. secure: true        — required by browsers for cross-origin cookies
//  2. sameSite: "none"    — required for cookies sent from a different domain
//  3. httpOnly: true      — prevents JS access (XSS protection)
//  4. NO domain: field    — letting the browser infer the domain is safer than
//                           setting it explicitly, which can cause issues on
//                           Railway's shared infra
//
// Detection: COOKIE_SECURE=true env var is the most reliable signal on Railway
// because NODE_ENV may or may not be set depending on the deploy config.

const isSecure =
  process.env.COOKIE_SECURE === "true" ||
  process.env.NODE_ENV === "production";

// SameSite=none is ONLY valid when Secure=true
// SameSite=lax works for local development (same origin)
const sameSite = isSecure ? "none" : "lax";

// Log the cookie config on startup so it's visible in Railway logs
console.log(`[cookies] secure=${isSecure} sameSite=${sameSite} (NODE_ENV=${process.env.NODE_ENV} COOKIE_SECURE=${process.env.COOKIE_SECURE})`);

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isSecure,
  sameSite,
  maxAge:   24 * 60 * 60 * 1000, // 1 day in ms
  // No domain: field — let browser use the response host
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isSecure,
  sameSite,
  maxAge:   10 * 24 * 60 * 60 * 1000, // 10 days in ms
  // No domain: field
};

// clearCookie MUST have identical flags to the original Set-Cookie call.
// Any mismatch (including domain, path, secure) causes the browser to
// treat it as a different cookie and ignore the clear.
export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isSecure,
  sameSite,
  // No domain: field
};
