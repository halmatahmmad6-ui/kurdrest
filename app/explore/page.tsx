"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { MasonryGrid } from "@/components/masonry-grid";
import { PinModal } from "@/components/pin-modal";
import { Pin } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All", "Interior", "Fashion", "Travel", "Food", "DIY", "Photography", "Typography", "Nature",
];

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageInner />
    </Suspense>
  );
}

function ExplorePageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = React.useState(initialQuery);
  const [activeQuery, setActiveQuery] = React.useState(initialQuery);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [pins, setPins] = React.useState<Pin[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [selectedPin, setSelectedPin] = React.useState<Pin | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const fetchPage = React.useCallback(async (category: string, q: string, pageNum: number, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, page: String(pageNum), pageSize: "12" });
      if (q) params.set("q", q);
      const res = await fetch(`/api/pins?${params}`, { cache: "no-store" });
      const data = await res.json();
      setPins((prev) => (replace ? data.pins : [...prev, ...data.pins]));
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setPage(1);
    fetchPage(activeCategory, activeQuery, 1, true);
  }, [activeCategory, activeQuery, fetchPage]);

  const handleLoadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(activeCategory, activeQuery, next, false);
  }, [loading, hasMore, page, activeCategory, activeQuery, fetchPage]);

  const openPin = (pin: Pin) => {
    setSelectedPin(pin);
    setModalOpen(true);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setActiveQuery(query);
        }}
        className="relative mb-5 max-w-lg"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="گەڕان بۆ بیرۆکە، تاگ..."
          className="h-11 w-full rounded-full border border-border bg-muted pl-11 pr-4 text-sm outline-none focus:border-ring focus:bg-surface"
        />
      </form>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-muted text-foreground/80 hover:bg-surface-hover"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {pins.length === 0 && !loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">هیچ ئەنجامێک نەدۆزرایەوە.</p>
      ) : (
        <MasonryGrid
          pins={pins}
          onOpenPin={openPin}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
          onRemovePin={(id) => setPins((prev) => prev.filter((p) => p.id !== id))}
        />
      )}

      <PinModal
        pin={selectedPin}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRemove={() => selectedPin && setPins((prev) => prev.filter((p) => p.id !== selectedPin.id))}
      />
    </div>
  );
}
