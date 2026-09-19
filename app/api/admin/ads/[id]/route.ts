import { NextResponse } from "next/server";
import { deleteAd } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  deleteAd(id);
  return NextResponse.json({ ok: true });
}
