import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { findUserById } from "./db";
import { PublicUser, toPublicUser } from "./db-types";

export const SESSION_COOKIE = "session";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn("[auth] JWT_SECRET is not set — using an insecure default. Set it in your environment before deploying.");
}

export function signSessionToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifySessionToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

/** Reads the session cookie (Server Components, Route Handlers) and returns the logged-in user, if any. */
export function getCurrentUser(): PublicUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

/**
 * Cookie options for the session cookie.
 *
 * `secure: true` tells the browser to only ever send the cookie over HTTPS.
 * If we hardcode that to `NODE_ENV === "production"` it silently breaks
 * login on any production deploy that isn't served over HTTPS (a plain
 * `next start` behind an http-only preview URL, a custom server without
 * TLS, etc.) — the API call succeeds and sets the cookie, but the browser
 * throws it away, so `/api/auth/me` never sees a session and the user
 * looks logged out right after signing up or logging in. So detect the
 * actual protocol of the incoming request instead of guessing from
 * NODE_ENV.
 */
export function getSessionCookieOptions(req?: NextRequest) {
  const proto = req?.headers.get("x-forwarded-proto") ?? req?.nextUrl.protocol.replace(":", "");
  const isHttps = proto === "https";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

/** @deprecated use getSessionCookieOptions(req) so `secure` matches the real request protocol. */
export const SESSION_COOKIE_OPTIONS = getSessionCookieOptions();
