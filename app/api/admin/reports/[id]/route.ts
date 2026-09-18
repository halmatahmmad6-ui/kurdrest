import { NextResponse } from "next/server";
import { resolveReport } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const admin = getCurrentUser();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  resolveReport(params.id);
  return NextResponse.json({ ok: true });
}
