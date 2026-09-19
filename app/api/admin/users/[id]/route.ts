import { NextRequest, NextResponse } from "next/server";
import { deleteUser, findUserById, updateUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const role = body?.role === "admin" ? "admin" : body?.role === "user" ? "user" : undefined;
  if (!role) return NextResponse.json({ error: "رۆڵی نادروست." }, { status: 400 });

  const updated = updateUser(id, { role });
  if (!updated) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json({ user: toPublicUser(updated) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  if (admin.id === id) return NextResponse.json({ error: "ناتوانیت هەژماری خۆت بسڕیتەوە." }, { status: 400 });

  const target = findUserById(id);
  if (!target) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });

  deleteUser(id);
  return NextResponse.json({ ok: true });
}
