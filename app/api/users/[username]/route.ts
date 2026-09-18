import { NextResponse } from "next/server";
import { findUserByUsername, getBoardsByOwner, getPinsByAuthor, pinToPublic } from "@/lib/db";
import { toPublicUser } from "@/lib/db-types";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const user = findUserByUsername(params.username);
  if (!user) return NextResponse.json({ error: "بەکارهێنەر نەدۆزرایەوە." }, { status: 404 });

  const viewer = getCurrentUser();
  const pins = getPinsByAuthor(user.id).map((p) => pinToPublic(p, viewer?.id));
  const boards = getBoardsByOwner(user.id).map((b) => ({
    id: b.id,
    name: b.name,
    coverImageUrl: b.coverImageUrl,
    pinCount: b.pinIds.length,
    isPrivate: b.isPrivate,
  }));

  return NextResponse.json({
    user: toPublicUser(user),
    pins,
    boards,
    isSelf: viewer?.id === user.id,
    isFollowing: viewer ? user.followerIds.includes(viewer.id) : false,
    followerCount: user.followerIds.length,
    followingCount: user.followingIds.length,
  });
}
