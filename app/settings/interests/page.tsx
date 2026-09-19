"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { INTEREST_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export default function RefineRecommendationsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user) setSelected(user.interests ?? []);
  }, [user, loading, router]);

  function toggle(cat: string) {
    setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected }),
      });
      if (res.ok) {
        await refresh();
        setMessage("پاشەکەوت کرا — لاپەڕەی سەرەکیت ئێستا زیاتر پیلی هاوشێوەت پیشان دەدات.");
      } else {
        setMessage("پاشەکەوتکردن سەرکەوتوو نەبوو.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">باشترکردنی پێشنیارەکانت</h1>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        بابەتەکانی حەزت لێیان دەکەیت هەڵبژێرە. لاپەڕەی سەرەکی پێشتر پیلی هاوشێوەی ئەمانەت پیشان دەدات، بەبێ ئەوەی هیچ شتێکی تر بشارێتەوە.
      </p>

      <div className="flex flex-wrap gap-2">
        {INTEREST_CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-foreground/80 hover:bg-surface-hover"
              )}
            >
              {active && <Check className="h-3.5 w-3.5" />}
              {cat}
            </button>
          );
        })}
      </div>

      {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

      <Button className="mt-6" onClick={handleSave} disabled={saving}>
        {saving ? "پاشەکەوتکردن..." : "پاشەکەوتکردن"}
      </Button>
    </div>
  );
}
