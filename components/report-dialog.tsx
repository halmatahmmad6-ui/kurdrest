"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { REPORT_REASONS, ReportReasonId } from "@/lib/db-types";

interface ReportDialogProps {
  pinId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ pinId, open, onOpenChange }: ReportDialogProps) {
  const [submitting, setSubmitting] = React.useState<ReportReasonId | null>(null);
  const [done, setDone] = React.useState(false);

  async function handleSelect(reason: ReportReasonId) {
    setSubmitting(reason);
    try {
      const res = await fetch(`/api/pins/${pinId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(null);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTimeout(() => setDone(false), 200);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-extrabold">ڕاپۆرتکردنی پیل</h2>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium">سوپاس — ڕاپۆرتەکەت ڕاستەوخۆ نێردرا بۆ بەڕێوەبەران.</p>
            <p className="mt-1 text-xs text-muted-foreground">تیمی بەڕێوەبردن پێداچوونەوەی بۆ دەکات.</p>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason.id}
                disabled={submitting !== null}
                onClick={() => handleSelect(reason.id)}
                className="flex w-full items-center justify-between gap-3 rounded-xl p-3.5 text-left hover:bg-surface-hover disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-bold">{reason.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{reason.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
