import { NextRequest, NextResponse } from "next/server";
import { deleteUser, findUserById, updateUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const role = body?.role === "admin" ? "admin" : body?.role === "user" ? "user" : undefined;
  if (!role) return NextResponse.json({ error: "رۆڵی نادروست." }, { status: 400 });

  const updated = updateUser(params.id, { role });
  if (!updated) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });
  return NextResponse.json({ user: toPublicUser(updated) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  if (admin.id === params.id) return NextResponse.json({ error: "ناتوانیت هەژماری خۆت بسڕیتەوە." }, { status: 400 });

  const target = findUserById(params.id);
  if (!target) return NextResponse.json({ error: "نەدۆزرایەوە." }, { status: 404 });

  deleteUser(params.id);
  return NextResponse.json({ ok: true });
}
