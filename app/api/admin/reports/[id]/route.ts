import { NextResponse } from "next/server";
import { resolveReport } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  resolveReport(id);
  return NextResponse.json({ ok: true });
}
