import { NextRequest, NextResponse } from "next/server";
import { createAd, getAds } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });
  return NextResponse.json({ ads: getAds() });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const title = (body?.title || "").trim();
  const description = (body?.description || "").trim();
  const imageUrl = body?.imageUrl;
  const mediaType: "image" | "video" = body?.mediaType === "video" ? "video" : "image";
  const sponsor = (body?.sponsor || "").trim();
  const linkUrl = (body?.linkUrl || "").trim();
  const aspectRatio = Number(body?.aspectRatio) || 1;
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6)
    : [];
  const startDate: string | undefined = (body?.startDate || "").trim() || undefined;
  const endDate: string | undefined = (body?.endDate || "").trim() || undefined;

  if (!title || !imageUrl || !sponsor || !linkUrl) {
    return NextResponse.json({ error: "ناونیشان، وێنە، بازرگان و بەستەر پێویستن." }, { status: 400 });
  }
  if (startDate && endDate && endDate < startDate) {
    return NextResponse.json({ error: "بەرواری بەسەرچوون نابێت پێش بەرواری دەستپێک بێت." }, { status: 400 });
  }

  const ad = createAd({ title, description, imageUrl, mediaType, aspectRatio, sponsor, linkUrl, tags, startDate, endDate });
  return NextResponse.json({ ad }, { status: 201 });
}
