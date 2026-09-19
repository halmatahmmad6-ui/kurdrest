"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function RemovalsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  const canConfirm = confirmText.trim().toLowerCase() === user.username.toLowerCase();

  async function handleDelete() {
    if (!canConfirm) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (!res.ok) {
        setError("سڕینەوە سەرکەوتوو نەبوو.");
        return;
      }
      await logout();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">سڕینەوەکان</h1>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        لێرەوە دەتوانیت داوای سڕینەوەی هەژمار و هەموو پیل و بۆردەکانت بکەیت. ئەم کردارە{" "}
        <span className="font-semibold text-destructive">ناگەڕێتەوە</span>.
      </p>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="mb-3 text-sm font-semibold">
          بۆ دڵنیابوونەوە، ناوی بەکارهێنەریت (<span className="font-mono">{user.username}</span>) لێرە بنووسە:
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={user.username}
          className="mb-3 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-ring"
        />
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        <Button
          variant="destructive"
          disabled={!canConfirm || busy}
          onClick={handleDelete}
        >
          {busy ? "سڕینەوە..." : "سڕینەوەی هەژمارەکەم بۆ هەمیشە"}
        </Button>
      </div>
    </div>
  );
}
