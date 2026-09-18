import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";

// Needs the Node.js runtime (not Edge) because it writes to the filesystem.
export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 40 * 1024 * 1024; // 40MB (video-friendly)
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "پێویستە بچیتە ژوورەوە." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "هیچ فایلێک نەنێردرا." }, { status: 400 });
  }
  if (!(file.type in ALLOWED)) {
    return NextResponse.json({ error: "جۆری فایل پشتگیری نەکراوە. تەنها JPG, PNG, WEBP, GIF, MP4, WEBM, MOV." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "قەبارەی فایل زۆر گەورەیە (زیاتر لە ٤٠ مێگابایت)." }, { status: 413 });
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const ext = ALLOWED[file.type];
  const filename = `${uuid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
