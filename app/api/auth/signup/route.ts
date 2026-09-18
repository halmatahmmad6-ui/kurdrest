import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, findUserByUsername } from "@/lib/db";
import { signSessionToken, SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = (body?.name || "").trim();
  const username = (body?.username || "").trim().toLowerCase();
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";

  if (!name || !username || !email || !password) {
    return NextResponse.json({ error: "هەموو خانەکان پێویستن (ناو، ناوی بەکارهێنەر، ئیمەیل، وشەی نهێنی)." }, { status: 400 });
  }
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    return NextResponse.json({ error: "ناوی بەکارهێنەر تەنها پیتی لاتینی و ژمارە و _ . دەگرێتەوە (٣-٢٠ پیت)." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت." }, { status: 400 });
  }
  if (findUserByUsername(username)) {
    return NextResponse.json({ error: "ئەم ناوی بەکارهێنەرە پێشتر بەکارهاتووە." }, { status: 409 });
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "ئەم ئیمەیلە پێشتر تۆمارکراوە." }, { status: 409 });
  }

  const user = createUser({ name, username, email, password });
  const token = signSessionToken(user.id);

  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions(req));
  return res;
}
