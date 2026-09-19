"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function PrivacyRightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/users/me/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user!.username}-data.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">مافەکانی تایبەتیت</h1>
      </div>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>
          تۆ مافی ئەوەت هەیە بزانیت چ زانیارییەکت لەلای ئێمە هەیە، کۆپییەکی داتاکانت وەربگریت، یان داوای سڕینەوەیان بکەیت.
        </p>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-semibold text-foreground">داونلۆدکردنی داتاکانم</p>
          <p className="mb-3">
            فایلێکی JSON وەردەگریت کە پرۆفایل، پیلەکان، بۆردەکان، و ڕاپۆرتەکانت لەخۆدەگرێت.
          </p>
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4" />
            {downloading ? "ئامادەکردن..." : "داونلۆدکردنی داتاکانم"}
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-1 text-sm font-semibold text-foreground">سڕینەوەی هەژمار</p>
          <p className="mb-3">دەتوانیت داوای سڕینەوەی هەمیشەیی هەژمارەکەت بکەیت.</p>
          <Link href="/settings/removals" className="text-sm font-semibold text-brand-600 hover:underline">
            بڕۆ بۆ سڕینەوەکان →
          </Link>
        </div>
      </div>
    </div>
  );
}
