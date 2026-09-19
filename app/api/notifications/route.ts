import { NextResponse } from "next/server";
import { findPinById, findUserById, getNotificationsForUser, markAllNotificationsRead } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const notifications = getNotificationsForUser(user.id).map((n) => {
    const actor = findUserById(n.actorId);
    const pin = n.pinId ? findPinById(n.pinId) : undefined;
    return {
      ...n,
      actor: actor ? toPublicUser(actor) : null,
      pin: pin ? { id: pin.id, title: pin.title, imageUrl: pin.imageUrl } : null,
    };
  });

  return NextResponse.json({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });
  markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
