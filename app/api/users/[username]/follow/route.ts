import { NextResponse } from "next/server";
import { toggleFollow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { username: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const result = toggleFollow(user.id, params.username);
  if (!result) return NextResponse.json({ error: "نەکرا." }, { status: 400 });
  return NextResponse.json(result);
}
