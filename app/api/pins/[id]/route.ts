import { NextRequest, NextResponse } from "next/server";
import { adminDeletePin, deletePin, findPinById, pinToPublic } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pin = findPinById(params.id);
  if (!pin) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });
  const viewer = getCurrentUser();
  return NextResponse.json({ pin: pinToPublic(pin, viewer?.id) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  const pin = findPinById(params.id);
  if (!pin) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });
  if (!user || (user.id !== pin.authorId && user.role !== "admin")) {
    return NextResponse.json({ error: "ڕێگەت پێنەدراوە." }, { status: 403 });
  }

  if (user.role === "admin" && user.id !== pin.authorId) {
    const body = await req.json().catch(() => ({}));
    const note = typeof body?.note === "string" ? body.note : undefined;
    adminDeletePin(params.id, user.id, note);
  } else {
    deletePin(params.id);
  }
  return NextResponse.json({ ok: true });
}
