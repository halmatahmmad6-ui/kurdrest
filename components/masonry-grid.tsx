"use client";

import * as React from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { Pin } from "@/lib/types";
import { PinCard } from "@/components/pin-card";

const BREAKPOINTS = {
  default: 5,
  1536: 5,
  1280: 4,
  1024: 3,
  768: 2,
  520: 2,
};

interface MasonryGridProps {
  pins: Pin[];
  onOpenPin: (pin: Pin) => void;
  /** called when the sentinel at the bottom scrolls into view */
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  /** called with a pin's id when the viewer hides or deletes it from the card menu */
  onRemovePin?: (id: string) => void;
}

export function MasonryGrid({ pins, onOpenPin, onLoadMore, hasMore, loading, onRemovePin }: MasonryGridProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  return (
    <div>
      <Masonry
        breakpointCols={BREAKPOINTS}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {pins.map((pin, i) => (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i % 12, 8) * 0.02 }}
          >
            <PinCard pin={pin} onOpen={onOpenPin} priority={i < 6} onRemove={onRemovePin ? () => onRemovePin(pin.id) : undefined} />
          </motion.div>
        ))}
      </Masonry>

      <div ref={sentinelRef} className="h-1 w-full" />

      {loading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-brand-500" />
        </div>
      )}

      {!hasMore && !loading && pins.length > 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          You've reached the end — that's every pin for now.
        </p>
      )}
    </div>
  );
}
