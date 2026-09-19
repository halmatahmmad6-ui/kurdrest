import { NextRequest, NextResponse } from "next/server";
import { approveAdRequest, rejectAdRequest } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  if (action === "approve") {
    const result = approveAdRequest(id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ad: result });
  }
  if (action === "reject") {
    const result = rejectAdRequest(id, typeof body?.note === "string" ? body.note : undefined);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "کردارێکی نادروست." }, { status: 400 });
}
