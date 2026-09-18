"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bookmark, Copy, Download, Eye, EyeOff, Flag, Share2, Trash2 } from "lucide-react";
import { Pin } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ReportDialog } from "@/components/report-dialog";
import { DeletePinDialog } from "@/components/delete-pin-dialog";
import { downloadImage, pinFilename } from "@/lib/download-image";

interface PinOptionsMenuProps {
  pin: Pin;
  trigger: React.ReactNode;
  /** called when the viewer chooses "See less" — remove this card from the current list */
  onHide?: () => void;
  /** called after a successful delete — remove this card / navigate away */
  onDeleted?: () => void;
  align?: "start" | "end";
}

export function PinOptionsMenu({ pin, trigger, onHide, onDeleted, align = "end" }: PinOptionsMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [reportOpen, setReportOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(pin.savedByMe);

  const canManage = !!user && (user.id === pin.author.id || user.role === "admin");
  const isAdminNotAuthor = !!user && user.role === "admin" && user.id !== pin.author.id;

  async function handleCopyLink() {
    const url = `${window.location.origin}/pin/${pin.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("لینکەکە کۆپی بکە:", url);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/pin/${pin.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: pin.title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    handleCopyLink();
  }

  async function handleSave() {
    if (!user) return router.push("/login");
    setSaved((s) => !s);
    await fetch(`/api/pins/${pin.id}/save`, { method: "POST" });
  }

  function handleSeeMore() {
    const tag = pin.tags[0];
    router.push(tag ? `/explore?q=${encodeURIComponent(tag)}` : "/explore");
  }

  async function handleDeleteConfirm(note?: string) {
    const res = await fetch(`/api/pins/${pin.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) onDeleted?.();
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            sideOffset={8}
            className="z-50 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-card-hover animate-scale-in"
          >
            <DropdownMenu.Item
              onSelect={handleSeeMore}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
            >
              <Eye className="h-4 w-4" /> زیاتری وەک ئەمە پیشانبدە
            </DropdownMenu.Item>

            {onHide && (
              <DropdownMenu.Item
                onSelect={onHide}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
              >
                <EyeOff className="h-4 w-4" /> کەمتری وەک ئەمە پیشانبدە
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item
              onSelect={handleSave}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
            >
              <Bookmark className={saved ? "h-4 w-4 fill-brand-500 text-brand-500" : "h-4 w-4"} />
              {saved ? "هەڵگیراوە" : "هەڵگرتن"}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={handleShare}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
            >
              <Share2 className="h-4 w-4" /> هاوبەشکردن
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                handleCopyLink();
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
            >
              <Copy className="h-4 w-4" /> {copied ? "کۆپی کرا ✓" : "کۆپیکردنی لینک"}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => downloadImage(pin.imageUrl, pinFilename(pin.imageUrl, pin.title))}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
            >
              <Download className="h-4 w-4" /> داگرتنی وێنە
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-border" />

            <DropdownMenu.Item
              onSelect={() => {
                if (!user) return router.push("/login");
                setReportOpen(true);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive outline-none hover:bg-surface-hover"
            >
              <Flag className="h-4 w-4" /> ڕاپۆرتکردن
            </DropdownMenu.Item>

            {canManage && (
              <DropdownMenu.Item
                onSelect={() => setDeleteOpen(true)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive outline-none hover:bg-surface-hover"
              >
                <Trash2 className="h-4 w-4" /> سڕینەوە
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ReportDialog pinId={pin.id} open={reportOpen} onOpenChange={setReportOpen} />
      <DeletePinDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        showNoteField={isAdminNotAuthor}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
