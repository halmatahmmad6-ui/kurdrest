"use client";

import * as React from "react";
import { MasonryGrid } from "@/components/masonry-grid";
import { PinModal } from "@/components/pin-modal";
import { Pin } from "@/lib/types";

export function RelatedPinsClient({ pins: initialPins }: { pins: Pin[] }) {
  const [pins, setPins] = React.useState(initialPins);
  const [selectedPin, setSelectedPin] = React.useState<Pin | null>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MasonryGrid
        pins={pins}
        onOpenPin={(pin) => {
          setSelectedPin(pin);
          setOpen(true);
        }}
        onRemovePin={(id) => setPins((prev) => prev.filter((p) => p.id !== id))}
      />
      <PinModal
        pin={selectedPin}
        open={open}
        onOpenChange={setOpen}
        onRemove={() => selectedPin && setPins((prev) => prev.filter((p) => p.id !== selectedPin.id))}
      />
    </>
  );
}
