import { NextResponse } from "next/server";
import { toggleSave } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });
  const result = toggleSave(params.id, user.id);
  if (!result) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json(result);
}
