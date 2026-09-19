"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinOptionsMenu } from "@/components/pin-options-menu";
import { Pin } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function PinDetailActions({ pin }: { pin: Pin }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = React.useState(pin.savedByMe);

  async function handleSave() {
    if (!user) return router.push("/login");
    setSaved((s) => !s);
    await fetch(`/api/pins/${pin.id}/save`, { method: "POST" });
  }

  return (
    <div className="flex items-center gap-2">
      <PinOptionsMenu
        pin={pin}
        onDeleted={() => {
          router.push("/");
          router.refresh();
        }}
        trigger={
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-surface-hover"
            aria-label="زیاتر"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <Button onClick={handleSave} className={cn(saved && "bg-foreground hover:bg-foreground/90")}>
        {saved ? "هەڵگیراوە" : "هەڵگرتن"}
      </Button>
    </div>
  );
}
