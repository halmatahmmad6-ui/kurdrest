import { NextRequest, NextResponse } from "next/server";
import { createAdRequest } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const sponsor = (body?.sponsor || "").trim();
  const linkUrl = (body?.linkUrl || "").trim();
  if (!sponsor || !linkUrl) {
    return NextResponse.json({ error: "ناوی بازرگان و بەستەر پێویستن." }, { status: 400 });
  }

  const result = createAdRequest(id, user.id, sponsor, linkUrl);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ request: result }, { status: 201 });
}
