"use client";

import * as React from "react";
import { MasonryGrid } from "@/components/masonry-grid";
import { PinModal } from "@/components/pin-modal";
import { Pin } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [pins, setPins] = React.useState<Pin[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [selectedPin, setSelectedPin] = React.useState<Pin | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const fetchPage = React.useCallback(async (category: string, pageNum: number, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, page: String(pageNum), pageSize: "12" });
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
    fetchPage(activeCategory, 1, true);
  }, [activeCategory, fetchPage]);

  const handleLoadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(activeCategory, next, false);
  }, [loading, hasMore, page, activeCategory, fetchPage]);

  const openPin = (pin: Pin) => {
    setSelectedPin(pin);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Category chips */}
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

      <MasonryGrid
        pins={pins}
        onOpenPin={openPin}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        onRemovePin={(id) => setPins((prev) => prev.filter((p) => p.id !== id))}
      />

      <PinModal
        pin={selectedPin}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRemove={() => selectedPin && setPins((prev) => prev.filter((p) => p.id !== selectedPin.id))}
      />
    </div>
  );
}
