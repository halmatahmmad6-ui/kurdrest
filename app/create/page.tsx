"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Images, Plus, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface MediaItem {
  file: File;
  previewUrl: string;
  aspectRatio: number;
  mediaType: "image" | "video";
}

function loadMediaMeta(file: File): Promise<{ aspectRatio: number; mediaType: "image" | "video" }> {
  const isVideo = file.type.startsWith("video/");
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    if (isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({ aspectRatio: (video.videoHeight || 1) / (video.videoWidth || 1), mediaType: "video" });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => resolve({ aspectRatio: 1, mediaType: "video" });
      video.src = url;
    } else {
      const img = new window.Image();
      img.onload = () => {
        resolve({ aspectRatio: (img.naturalHeight || 1) / (img.naturalWidth || 1), mediaType: "image" });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => resolve({ aspectRatio: 1, mediaType: "image" });
      img.src = url;
    }
  });
}

export default function CreatePinPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList).slice(0, 10 - items.length);
    const withMeta = await Promise.all(
      files.map(async (file) => {
        const meta = await loadMediaMeta(file);
        return { file, previewUrl: URL.createObjectURL(file), ...meta };
      })
    );
    setItems((prev) => [...prev, ...withMeta]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("تکایە لانیکەم یەک وێنە یان ڤیدیۆ هەڵبژێرە.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const uploaded: { imageUrl: string; aspectRatio: number; mediaType: "image" | "video" }[] = [];

      for (let i = 0; i < items.length; i++) {
        setProgress(`ئەپلۆدکردنی ${i + 1} لە ${items.length}...`);
        const formData = new FormData();
        formData.append("file", items[i].file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "ئەپلۆدکردن سەرکەوتوو نەبوو.");
          return;
        }
        uploaded.push({ imageUrl: uploadData.url, aspectRatio: items[i].aspectRatio, mediaType: items[i].mediaType });
      }

      setProgress("بڵاوکردنەوە...");

      if (uploaded.length === 1) {
        const pinRes = await fetch("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, tags: tagList, ...uploaded[0] }),
        });
        const pinData = await pinRes.json();
        if (!pinRes.ok) {
          setError(pinData.error || "دروستکردنی پیل سەرکەوتوو نەبوو.");
          return;
        }
        router.push(`/pin/${pinData.pin.id}`);
      } else {
        const albumRes = await fetch("/api/pins/album", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, tags: tagList, items: uploaded }),
        });
        const albumData = await albumRes.json();
        if (!albumRes.ok) {
          setError(albumData.error || "دروستکردنی ئەلبووم سەرکەوتوو نەبوو.");
          return;
        }
        router.push(`/pin/${albumData.pins[0].id}`);
      }
      router.refresh();
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="mb-1 font-display text-2xl font-extrabold">زیادکردنی پیلی نوێ</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        زیاتر لە وێنە/ڤیدیۆیەک هەڵبژێرە بۆ دروستکردنی ئەلبووم — هەموویان بە یەک ناونیشان و تاگ بڵاو دەکرێنەوە.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.2fr]">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = "";
            }}
          />

          {items.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm font-semibold">کرتە بکە بۆ ئەپلۆدکردنی وێنە یان ڤیدیۆ</span>
              <span className="text-xs">دەتوانیت چەندین فایل هەڵبژێریت — تا ٤٠ مێگابایت بۆ هەریەکە</span>
            </button>
          ) : (
            <div>
              {items.length > 1 && (
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  <Images className="h-4 w-4" /> ئەلبووم — {items.length} فایل
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {items.map((item, i) => (
                  <div
                    key={item.previewUrl}
                    className="relative overflow-hidden rounded-xl bg-muted"
                    style={{ aspectRatio: `1 / ${Math.min(item.aspectRatio, 1.6)}` }}
                  >
                    {item.mediaType === "video" ? (
                      <video src={item.previewUrl} className="absolute inset-0 h-full w-full object-cover" muted />
                    ) : (
                      // Plain <img>: local blob: URL, not fetchable by next/image's optimizer.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                      aria-label="لابردن"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {items.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted text-muted-foreground hover:border-ring hover:text-foreground"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs font-semibold">زیادکردنی زیاتر</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">ناونیشان</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
              placeholder="ناونیشانێکی کورت و ڕوون بنووسە"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">وەسف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-ring focus:bg-surface"
              placeholder="زیاتر باسی ئەم وێنەیە بکە..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">تاگەکان (بە کۆما جیاکراوە)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
              placeholder="interior, design, minimal"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {progress && !error && <p className="text-sm text-muted-foreground">{progress}</p>}

          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "چاوەڕوانبە..." : items.length > 1 ? "بڵاوکردنەوەی ئەلبووم" : "بڵاوکردنەوە"}
          </Button>
        </div>
      </form>
    </div>
  );
}
