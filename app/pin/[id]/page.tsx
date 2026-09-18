import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPinById, getPinsByAlbum, getRelatedPins, pinToPublic } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Images } from "lucide-react";

import { PinDetailActions } from "./pin-detail-actions";
import { RelatedPinsClient } from "./related-pins-client";

export default function PinDetailPage({ params }: { params: { id: string } }) {
  const dbPin = findPinById(params.id);
  if (!dbPin) notFound();

  const viewer = getCurrentUser();
  const pin = pinToPublic(dbPin, viewer?.id);
  const related = getRelatedPins(dbPin).map((p) => pinToPublic(p, viewer?.id));
  const albumSiblings = dbPin.albumId
    ? getPinsByAlbum(dbPin.albumId, dbPin.id).map((p) => pinToPublic(p, viewer?.id))
    : [];

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 rounded-3xl bg-surface p-4 shadow-card md:grid-cols-[1.1fr_1fr] md:p-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted md:aspect-auto">
          {pin.mediaType === "video" ? (
            <video src={pin.imageUrl} controls muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <Image src={pin.imageUrl} alt={pin.title} fill className="object-cover" priority />
          )}
          {dbPin.albumId && (
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
              <Images className="h-3.5 w-3.5" /> ئەلبووم · {albumSiblings.length + 1} وێنە
            </span>
          )}
        </div>

        <div className="flex flex-col py-2">
          <div className="mb-4 flex items-center justify-end gap-2">
            <PinDetailActions pin={pin} />
          </div>

          <h1 className="font-display text-3xl font-extrabold leading-tight">{pin.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{pin.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {pin.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80">
                #{tag}
              </span>
            ))}
          </div>

          <Link
            href={`/profile/${pin.author.username}`}
            className="-mx-2 mt-6 flex items-center gap-3 rounded-xl p-2 hover:bg-surface-hover"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={pin.author.avatarUrl} alt={pin.author.name} />
              <AvatarFallback>{pin.author.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{pin.author.name}</p>
              <p className="text-xs text-muted-foreground">@{pin.author.username}</p>
            </div>
          </Link>

          <div className="my-6 h-px bg-border" />

          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Heart className="h-4 w-4" /> {pin.likeCount}
            </span>
            <span>{pin.commentCount} کۆمێنت</span>
            <span>{pin.saveCount} هەڵگیراوە</span>
          </div>
        </div>
      </div>

      {albumSiblings.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 font-display text-xl font-bold">وێنەکانی تری ئەم ئەلبومە</h2>
          <RelatedPinsClient pins={albumSiblings} />
        </>
      )}

      {related.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 font-display text-xl font-bold">شتی هاوشێوە</h2>
          <RelatedPinsClient pins={related} />
        </>
      )}
    </div>
  );
}
