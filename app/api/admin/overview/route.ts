import { NextResponse } from "next/server";
import { getUsers, getPins } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const users = getUsers().map(toPublicUser);
  const pins = getPins();
  return NextResponse.json({ users, pins });
}
