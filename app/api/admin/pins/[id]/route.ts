import { NextRequest, NextResponse } from "next/server";
import { adminDeletePin, findPinById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getCurrentUser();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  if (!findPinById(params.id)) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note : undefined;

  adminDeletePin(params.id, admin.id, note);
  return NextResponse.json({ ok: true });
}
