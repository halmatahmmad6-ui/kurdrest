import { NextRequest, NextResponse } from "next/server";
import { createReport, findPinById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { REPORT_REASONS, ReportReasonId } from "@/lib/db-types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });
  if (!findPinById(id)) return NextResponse.json({ error: "پیل نەدۆزرایەوە." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const reason = body?.reason as ReportReasonId | undefined;
  if (!reason || !REPORT_REASONS.some((r) => r.id === reason)) {
    return NextResponse.json({ error: "هۆکاری نادروست." }, { status: 400 });
  }

  const report = createReport(id, user.id, reason);
  return NextResponse.json({ report }, { status: 201 });
}
