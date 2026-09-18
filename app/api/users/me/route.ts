import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUser } from "@/lib/db";
import { toPublicUser } from "@/lib/db-types";

export async function PATCH(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const patch: { name?: string; bio?: string; avatarUrl?: string } = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body?.bio === "string") patch.bio = body.bio.trim();
  if (typeof body?.avatarUrl === "string" && body.avatarUrl.trim()) patch.avatarUrl = body.avatarUrl.trim();

  const updated = updateUser(user.id, patch);
  if (!updated) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json({ user: toPublicUser(updated) });
}
