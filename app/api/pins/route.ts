import { NextRequest, NextResponse } from "next/server";
import { createPin, getPins, pinToPublic } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const viewer = getCurrentUser();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim().toLowerCase();
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "12");

  let pins = getPins();
  if (category && category.toLowerCase() !== "all") {
    pins = pins.filter((p) => p.tags.some((t) => t.toLowerCase().includes(category.toLowerCase())));
  }
  if (q) {
    pins = pins.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const start = (page - 1) * pageSize;
  const pageItems = pins.slice(start, start + pageSize);

  return NextResponse.json({
    pins: pageItems.map((p) => pinToPublic(p, viewer?.id)),
    total: pins.length,
    hasMore: start + pageSize < pins.length,
  });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە بۆ زیادکردنی وێنە." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = (body?.title || "").trim();
  const description = (body?.description || "").trim();
  const imageUrl = body?.imageUrl;
  const aspectRatio = Number(body?.aspectRatio) || 1;
  const mediaType = body?.mediaType === "video" ? "video" : "image";
  const tags: string[] = Array.isArray(body?.tags)
    ? body.tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6)
    : [];

  if (!title || !imageUrl) {
    return NextResponse.json({ error: "ناونیشان و وێنە پێویستن." }, { status: 400 });
  }

  const pin = createPin({ title, description, imageUrl, aspectRatio, tags, authorId: user.id, mediaType });
  return NextResponse.json({ pin: pinToPublic(pin, user.id) }, { status: 201 });
}
