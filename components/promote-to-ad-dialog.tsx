"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PromoteToAdDialogProps {
  pinId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromoteToAdDialog({ pinId, open, onOpenChange }: PromoteToAdDialogProps) {
  const [sponsor, setSponsor] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sponsor.trim() || !linkUrl.trim()) {
      setError("ناوی بازرگان و بەستەر پێویستن.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pins/${pinId}/request-ad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsor, linkUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "نێردرانی داواکاری سەرکەوتوو نەبوو.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        setDone(false);
        setSponsor("");
        setLinkUrl("");
        setError(null);
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-extrabold">کردنی پۆست بە ڕیکلام</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            داواکارییەکەت دەچێتە بەشی تایبەت بە ئەدمین بۆ پێداچوونەوە. تەنها دوای پەسەندکردنی ئەدمین، پۆستەکەت وەک ڕیکلام لە لاپەڕەی سەرەکیدا دەردەکەوێت.
          </p>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium">داواکارییەکەت نێردرا ✓</p>
            <p className="mt-1 text-xs text-muted-foreground">ئاگادارت دەکەینەوە کاتێک ئەدمین پێداچوونەوەی بۆ دەکات.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5">
            <input
              value={sponsor}
              onChange={(e) => setSponsor(e.target.value)}
              placeholder="ناوی بازرگان یان کۆمپانیا"
              className="h-11 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-ring"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="بەستەر (https://...)"
              className="h-11 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-ring"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "ناردن..." : "ناردنی داواکاری"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
