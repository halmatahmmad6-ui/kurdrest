import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteUser, updateUser } from "@/lib/db";
import { toPublicUser } from "@/lib/db-types";
import { SESSION_COOKIE } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const patch: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    interests?: string[];
    betaTester?: boolean;
    personalizedAds?: boolean;
  } = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body?.bio === "string") patch.bio = body.bio.trim();
  if (typeof body?.avatarUrl === "string" && body.avatarUrl.trim()) patch.avatarUrl = body.avatarUrl.trim();
  if (Array.isArray(body?.interests)) {
    patch.interests = body.interests.filter((t: unknown) => typeof t === "string").slice(0, 12);
  }
  if (typeof body?.betaTester === "boolean") patch.betaTester = body.betaTester;
  if (typeof body?.personalizedAds === "boolean") patch.personalizedAds = body.personalizedAds;

  const updated = updateUser(user.id, patch);
  if (!updated) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json({ user: toPublicUser(updated) });
}

/** Self-service account removal — "Removals" in Settings & Support. */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  deleteUser(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
