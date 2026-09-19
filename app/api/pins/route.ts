import { NextRequest, NextResponse } from "next/server";
import { adToPublicPin, createPin, getPins, pickAdForPosition, pinToPublic } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const viewer = await getCurrentUser();
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

  // "Refine your recommendations": on the unfiltered feed, gently float pins that match
  // the viewer's chosen interests to the top, without hiding anything else.
  const interests = viewer?.interests?.map((t) => t.toLowerCase()) ?? [];
  if ((!category || category.toLowerCase() === "all") && !q && interests.length > 0 && viewer?.personalizedAds !== false) {
    const matches: typeof pins = [];
    const rest: typeof pins = [];
    for (const p of pins) {
      (p.tags.some((t) => interests.includes(t.toLowerCase())) ? matches : rest).push(p);
    }
    pins = [...matches, ...rest];
  }

  // Group pins uploaded together as an album into a single feed card: the first pin of the
  // album stands in for the group and carries every image so the card can cycle through
  // them like a slideshow. The rest stay reachable from the pin detail page (getPinsByAlbum).
  const seenAlbums = new Set<string>();
  const grouped = pins.filter((p) => {
    if (!p.albumId) return true;
    if (seenAlbums.has(p.albumId)) return false;
    seenAlbums.add(p.albumId);
    return true;
  });

  const start = (page - 1) * pageSize;
  const pageItems = grouped.slice(start, start + pageSize);

  // Sponsored posts: one dropped in every few pins, styled like a regular post. The
  // "Refine your recommendations" interests pick which ad is most relevant, unless the
  // viewer turned Personalized Ads off — then ads still show, just not interest-matched.
  const adInterests = viewer?.personalizedAds === false ? [] : interests;
  const feedItems: ReturnType<typeof pinToPublic>[] = [];
  pageItems.forEach((p, i) => {
    const ad = pickAdForPosition(start + i, adInterests);
    if (ad) feedItems.push(adToPublicPin(ad));

    const pub = pinToPublic(p, viewer?.id);
    if (!p.albumId) {
      feedItems.push(pub);
      return;
    }
    const siblings = pins.filter((sib) => sib.albumId === p.albumId);
    feedItems.push({
      ...pub,
      albumImages: siblings.map((s) => ({
        imageUrl: s.imageUrl,
        mediaType: s.mediaType,
        aspectRatio: s.aspectRatio,
      })),
    });
  });

  return NextResponse.json({
    pins: feedItems,
    total: grouped.length,
    hasMore: start + pageSize < grouped.length,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
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
