"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Images, MoreHorizontal, PlayCircle, Share2 } from "lucide-react";
import { Pin } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PinOptionsMenu } from "@/components/pin-options-menu";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface PinCardProps {
  pin: Pin;
  onOpen: (pin: Pin) => void;
  priority?: boolean;
  /** called when the viewer picks "See less" or deletes this pin from the menu */
  onRemove?: () => void;
}

export function PinCard({ pin, onOpen, priority, onRemove }: PinCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = React.useState(pin.savedByMe);
  const [liked, setLiked] = React.useState(pin.likedByMe);
  const [likeCount, setLikeCount] = React.useState(pin.likeCount);
  const [busy, setBusy] = React.useState(false);

  // Albums cycle through their images like a slideshow right on the feed card.
  const slides = pin.albumImages && pin.albumImages.length > 1 ? pin.albumImages : null;
  const [slideIndex, setSlideIndex] = React.useState(0);
  React.useEffect(() => {
    if (!slides) return;
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [slides]);
  const activeMedia = slides ? slides[slideIndex] : { imageUrl: pin.imageUrl, mediaType: pin.mediaType };

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) return router.push("/login");
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s);
    try {
      await fetch(`/api/pins/${pin.id}/save`, { method: "POST" });
    } finally {
      setBusy(false);
    }
  }

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) return router.push("/login");
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    await fetch(`/api/pins/${pin.id}/like`, { method: "POST" });
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/pin/${pin.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: pin.title, url });
        return;
      } catch {
        /* cancelled — fall through to clipboard */
      }
    }
    navigator.clipboard?.writeText(url).catch(() => {});
  }

  return (
    <motion.div
      layoutId={`pin-${pin.id}`}
      className="group relative overflow-hidden rounded-2xl bg-muted shadow-card transition-shadow hover:shadow-card-hover"
      style={{ aspectRatio: `1 / ${pin.aspectRatio}` }}
    >
      <button
        onClick={() => onOpen(pin)}
        className="absolute inset-0 h-full w-full cursor-zoom-in"
        aria-label={`Open pin: ${pin.title}`}
      >
        {activeMedia.mediaType === "video" ? (
          <video
            key={activeMedia.imageUrl}
            src={activeMedia.imageUrl}
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => e.currentTarget.pause()}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <Image
            key={activeMedia.imageUrl}
            src={activeMedia.imageUrl}
            alt={pin.title}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 45vw"
            priority={priority}
            className="object-cover opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-[1.03] animate-fade-in [animation-fill-mode:forwards]"
          />
        )}
      </button>

      {slides && (
        <>
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            <Images className="h-3.5 w-3.5" /> {slideIndex + 1}/{slides.length}
          </div>
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white/50 transition-colors",
                  i === slideIndex && "bg-white"
                )}
              />
            ))}
          </div>
        </>
      )}

      {!slides && pin.mediaType === "video" && (
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
          <PlayCircle className="h-3.5 w-3.5" />
          Video
        </div>
      )}

      {/* Hover overlay with quick actions */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col justify-between p-3 opacity-0 transition-opacity duration-150",
          "bg-gradient-to-b from-black/35 via-transparent to-black/45 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        <div className="pointer-events-auto flex justify-end">
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            className={cn(saved && "bg-foreground text-background hover:bg-foreground/90")}
          >
            {saved ? "هەڵگیراوە" : "هەڵگرتن"}
          </Button>
        </div>

        <div className="pointer-events-auto flex items-center justify-between">
          <button
            onClick={handleLike}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm transition-transform hover:scale-105"
            aria-label="Like"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-brand-500 text-brand-500")} />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm transition-transform hover:scale-105"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <PinOptionsMenu
              pin={pin}
              onHide={onRemove}
              onDeleted={onRemove}
              trigger={
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm transition-transform hover:scale-105"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
