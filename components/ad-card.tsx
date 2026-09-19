"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Pin } from "@/lib/types";

export function AdCard({ pin }: { pin: Pin }) {
  return (
    <a
      href={pin.linkUrl}
      target="_blank"
      rel="noopener sponsored"
      className="group relative block overflow-hidden rounded-2xl bg-muted shadow-card transition-shadow hover:shadow-card-hover"
      style={{ aspectRatio: `1 / ${pin.aspectRatio}` }}
    >
      {pin.mediaType === "video" ? (
        <video
          src={pin.imageUrl}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <Image
          src={pin.imageUrl}
          alt={pin.title}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/10 via-transparent to-black/60 p-3">
        <span className="w-fit rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          ڕیکلام
        </span>
        <div className="text-white">
          <p className="line-clamp-2 text-sm font-bold">{pin.title}</p>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/85">
            {pin.sponsor}
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </a>
  );
}
