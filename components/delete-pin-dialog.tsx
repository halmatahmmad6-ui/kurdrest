"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** true when the current viewer is an admin deleting someone else's pin */
  showNoteField: boolean;
  onConfirm: (note?: string) => Promise<void> | void;
}

export function DeletePinDialog({ open, onOpenChange, showNoteField, onConfirm }: DeletePinDialogProps) {
  const [note, setNote] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm(showNoteField ? note.trim() || undefined : undefined);
      onOpenChange(false);
    } finally {
      setDeleting(false);
      setNote("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <h2 className="font-display text-lg font-extrabold">سڕینەوەی پیل</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          دڵنیایت لە سڕینەوەی ئەم پیلە؟ ئەم کردارە ناگەڕێتەوە.
        </p>

        {showNoteField && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold">
              تێبینی بۆ بەکارهێنەر <span className="font-normal text-muted-foreground">(ئارەزوومەندانە)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="بۆ نموونە: ئەم پیلە سڕایەوە چونکە یاسای هەڵگرتنی سایتی پێشێل کردووە."
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-ring focus:bg-surface"
            />
            <p className="mt-1 text-xs text-muted-foreground">ئەم تێبینیە وەک ئاگادارکردنەوە بۆ خاوەنی پیل دەنێردرێت.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={deleting}>
            پاشگەزبوونەوە
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "سڕینەوە..." : "سڕینەوە"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
