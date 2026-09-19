import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { STATIC_PAGES } from "@/lib/static-pages";

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = STATIC_PAGES[slug];
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/settings/support" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-extrabold">{content.title}</h1>
      </div>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
