import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReportsByReporter } from "@/lib/db";

/** Reports filed by the current user — "Reports and violations center". */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  return NextResponse.json({ reports: getReportsByReporter(user.id) });
}
