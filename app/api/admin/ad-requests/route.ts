import { NextRequest, NextResponse } from "next/server";
import { getAdRequests } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  return NextResponse.json({ requests: getAdRequests(status ?? undefined) });
}
