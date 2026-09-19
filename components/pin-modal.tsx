"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pin, PublicComment } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Download, Heart, MoreHorizontal, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PinOptionsMenu } from "@/components/pin-options-menu";
import { downloadImage, pinFilename } from "@/lib/download-image";

interface PinModalProps {
  pin: Pin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** called after this pin is deleted from the options menu, so the parent list can drop it */
  onRemove?: () => void;
}

export function PinModal({ pin, open, onOpenChange, onRemove }: PinModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [saved, setSaved] = React.useState(pin?.savedByMe ?? false);
  const [liked, setLiked] = React.useState(pin?.likedByMe ?? false);
  const [likeCount, setLikeCount] = React.useState(pin?.likeCount ?? 0);
  const [comments, setComments] = React.useState<PublicComment[]>(pin?.comments ?? []);
  const [comment, setComment] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  // Reset local state whenever a different pin is opened.
  React.useEffect(() => {
    if (!pin) return;
    setSaved(pin.savedByMe);
    setLiked(pin.likedByMe);
    setLikeCount(pin.likeCount);
    setComments(pin.comments);
  }, [pin]);

  if (!pin) return null;

  async function handleSave() {
    if (!user) return router.push("/login");
    setSaved((s) => !s);
    await fetch(`/api/pins/${pin!.id}/save`, { method: "POST" });
  }

  async function handleLike() {
    if (!user) return router.push("/login");
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    await fetch(`/api/pins/${pin!.id}/like`, { method: "POST" });
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/pins/${pin!.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setComment("");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[88vh] grid-cols-1 p-0 md:grid-cols-[1.1fr_1fr]">
        {/* Media */}
        <div className="relative min-h-[280px] bg-black md:max-h-[88vh]">
          {pin.mediaType === "video" ? (
            <video src={pin.imageUrl} controls autoPlay muted loop playsInline className="h-full w-full object-contain" />
          ) : (
            <Image src={pin.imageUrl} alt={pin.title} fill sizes="50vw" className="object-contain" />
          )}
        </div>

        {/* Details */}
        <div className="flex max-h-[88vh] flex-col overflow-y-auto p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/pin/${pin.id}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: pin.title, url });
                      return;
                    } catch {
                      /* cancelled */
                    }
                  }
                  navigator.clipboard?.writeText(url).catch(() => {});
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-surface-hover"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => downloadImage(pin.imageUrl, pinFilename(pin.imageUrl, pin.title))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-surface-hover"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <PinOptionsMenu
                pin={pin}
                onDeleted={() => {
                  onRemove?.();
                  onOpenChange(false);
                }}
                trigger={
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-surface-hover" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              />
            </div>
            <Button onClick={handleSave} className={cn(saved && "bg-foreground hover:bg-foreground/90")}>
              {saved ? "هەڵگیراوە" : "هەڵگرتن"}
            </Button>
          </div>

          <h1 className="font-display text-2xl font-extrabold leading-snug">{pin.title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{pin.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {pin.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80">
                #{tag}
              </span>
            ))}
          </div>

          <Link
            href={`/profile/${pin.author.username}`}
            className="mt-5 flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-surface-hover"
          >
            <Avatar className="h-11 w-11">
              <AvatarImage src={pin.author.avatarUrl} alt={pin.author.name} />
              <AvatarFallback>{pin.author.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{pin.author.name}</p>
              <p className="text-xs text-muted-foreground">@{pin.author.username}</p>
            </div>
          </Link>

          <div className="my-5 h-px bg-border" />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button onClick={handleLike} className="flex items-center gap-1.5 font-semibold text-foreground">
              <Heart className={cn("h-4 w-4", liked && "fill-brand-500 text-brand-500")} />
              {likeCount}
            </button>
            <span>{comments.length} کۆمێنت</span>
            <span>{pin.saveCount} هەڵگیراوە</span>
          </div>

          <div className="my-5 h-px bg-border" />

          <div className="flex-1 space-y-4">
            <p className="text-sm font-semibold">کۆمێنتەکان</p>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">هیچ کۆمێنتێک نییە — یەکەم کەس بە کە کۆمێنت بنووسیت.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.author.avatarUrl} alt={c.author.name} />
                    <AvatarFallback>{c.author.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{c.author.name}</span> {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComment} className="sticky bottom-0 mt-4 flex items-center gap-2 border-t border-border bg-surface pt-4">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={user ? "کۆمێنتێک زیادبکە" : "بۆ کۆمێنت پێویستە بچیتە ژوورەوە"}
              disabled={!user}
              className="h-11 flex-1 rounded-full border border-border bg-muted px-4 text-sm outline-none focus:border-ring disabled:opacity-60"
            />
            <Button type="submit" size="sm" disabled={!comment.trim() || posting || !user}>
              ناردن
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
