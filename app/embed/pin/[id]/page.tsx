import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPinById, pinToPublic } from "@/lib/db";

export default async function EmbedPinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbPin = findPinById(id);
  if (!dbPin) notFound();
  const pin = pinToPublic(dbPin);

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <Link href={`/pin/${pin.id}`} target="_blank" className="relative block w-full" style={{ aspectRatio: `1 / ${pin.aspectRatio}` }}>
        <Image src={pin.imageUrl} alt={pin.title} fill className="object-cover" />
      </Link>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{pin.title}</p>
          <p className="text-xs text-muted-foreground">@{pin.author.username}</p>
        </div>
        <Link
          href={`/pin/${pin.id}`}
          target="_blank"
          className="shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
        >
          بینین
        </Link>
      </div>
    </div>
  );
}
