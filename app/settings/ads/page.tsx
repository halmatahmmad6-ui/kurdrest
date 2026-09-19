"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Toggle } from "@/components/ui/toggle";

export default function PersonalizedAdsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function handleToggle(next: boolean) {
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalizedAds: next }),
      });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;
  const enabled = user.personalizedAds !== false;

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">ڕیکلامی کەسیکراو</h1>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-semibold">بەکارهێنانی بابەتە دڵخوازەکانت بۆ باشترکردنی لاپەڕەی سەرەکی</p>
          <p className="mt-1 text-sm text-muted-foreground">
            کاتێک ئەمە داخراوە، لاپەڕەی سەرەکیت بە هەمان ڕیزبەندی گشتی پیشان دەدرێت و بابەتەکانی{" "}
            <span className="font-semibold">باشترکردنی پێشنیارەکانت</span> کاریگەری لەسەری نابێت.
          </p>
        </div>
        <Toggle checked={enabled} onChange={handleToggle} disabled={saving} />
      </div>
    </div>
  );
}
