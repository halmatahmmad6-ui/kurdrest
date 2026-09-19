import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exportUserData } from "@/lib/db";

/** Returns everything this account owns as one JSON file — "Your privacy rights" → download my data. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });

  const data = exportUserData(user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${user.username}-data.json"`,
    },
  });
}
