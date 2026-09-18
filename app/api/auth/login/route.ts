import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, findUserByUsername } from "@/lib/db";
import { signSessionToken, SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const identifier = (body?.identifier || "").trim().toLowerCase();
  const password = body?.password || "";

  if (!identifier || !password) {
    return NextResponse.json({ error: "ئیمەیل/ناوی بەکارهێنەر و وشەی نهێنی بنووسە." }, { status: 400 });
  }

  const user = identifier.includes("@") ? findUserByEmail(identifier) : findUserByUsername(identifier);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "زانیاریەکان هەڵەن — دووبارە هەوڵبدەرەوە." }, { status: 401 });
  }

  const token = signSessionToken(user.id);
  const res = NextResponse.json({ user: toPublicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions(req));
  return res;
}
