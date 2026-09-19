import { NextResponse } from "next/server";
import { toggleFollow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const result = toggleFollow(user.id, username);
  if (!result) return NextResponse.json({ error: "نەکرا." }, { status: 400 });
  return NextResponse.json(result);
}
