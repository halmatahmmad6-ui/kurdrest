import { NextRequest, NextResponse } from "next/server";
import { addComment } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const text = (body?.text || "").trim();
  if (!text) return NextResponse.json({ error: "کۆمێنت بەتاڵە." }, { status: 400 });

  const comment = addComment(params.id, user.id, text);
  if (!comment) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json({ comment: { id: comment.id, text: comment.text, createdAt: comment.createdAt, author: user } }, { status: 201 });
}
