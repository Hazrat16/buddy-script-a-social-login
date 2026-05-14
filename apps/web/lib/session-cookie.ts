/** HttpOnly session cookie name (shared by middleware, session helpers, API routes). */
export const SESSION_COOKIE = "buddy_session";

/** Must match Express `apps/api` `sessionCookieOptions` (same browser cookie semantics). */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
