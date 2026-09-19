"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Toggle } from "@/components/ui/toggle";

const PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
];

export default function ConnectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [connected, setConnected] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">بەستنەوە بە هەژمارەکانی تر</h1>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        هەژمارەکانت بەستەوە بۆ ئاسانکردنی چوونەژوورەوە. (ئەمە نموونەیەکی دیمۆیە — پەیوەندی ڕاستەقینە بە کۆمپانیاکانەوە ناکات.)
      </p>

      <div className="flex flex-col gap-2">
        {PROVIDERS.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <span className="text-sm font-semibold">{p.label}</span>
            <Toggle
              checked={!!connected[p.id]}
              onChange={(next) => setConnected((prev) => ({ ...prev, [p.id]: next }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
