import { NextRequest, NextResponse } from "next/server";
import { createAlbumPins, pinToPublic } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = (body?.title || "").trim();
  const description = (body?.description || "").trim();
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6)
    : [];
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!title || items.length < 2) {
    return NextResponse.json({ error: "ئەلبووم پێویستی بە ناونیشان و لانیکەم دوو وێنە هەیە." }, { status: 400 });
  }
  if (items.some((it: any) => !it?.imageUrl)) {
    return NextResponse.json({ error: "هەندێک وێنە ئەپلۆد نەکراون." }, { status: 400 });
  }

  const pins = createAlbumPins({
    title,
    description,
    tags,
    authorId: user.id,
    items: items.map((it: any) => ({
      imageUrl: it.imageUrl,
      aspectRatio: Number(it.aspectRatio) || 1,
      mediaType: it.mediaType === "video" ? "video" : "image",
    })),
  });

  return NextResponse.json({ pins: pins.map((p) => pinToPublic(p, user.id)) }, { status: 201 });
}
