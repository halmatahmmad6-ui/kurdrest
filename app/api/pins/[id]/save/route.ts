import { NextResponse } from "next/server";
import { toggleSave } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });
  const result = toggleSave(id, user.id);
  if (!result) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json(result);
}
