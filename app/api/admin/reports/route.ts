import { NextResponse } from "next/server";
import { findPinById, findUserById, getOpenReports } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/db-types";

export async function GET() {
  const admin = getCurrentUser();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "تەنها ئەدمین دەتوانێت." }, { status: 403 });

  const reports = getOpenReports().map((r) => {
    const pin = findPinById(r.pinId);
    const reporter = findUserById(r.reporterId);
    return {
      ...r,
      pin: pin ? { id: pin.id, title: pin.title, imageUrl: pin.imageUrl, authorId: pin.authorId } : null,
      reporter: reporter ? toPublicUser(reporter) : null,
    };
  });

  return NextResponse.json({ reports });
}
