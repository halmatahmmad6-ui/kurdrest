"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface ReportRow {
  id: string;
  status: "open" | "resolved";
  createdAt: string;
  reasonLabel: string;
  pinId: string;
  pinTitle: string | null;
  pinImageUrl: string | null;
}

export default function ReportsCenterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = React.useState<ReportRow[] | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    fetch("/api/users/me/reports", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setReports(data.reports ?? []));
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">ناوەندی ڕاپۆرت و پێشێلکاری</h1>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        ئەمانە ئەو پیلانەن کە تۆ ڕاپۆرتت لەسەریان کردووە، لەگەڵ ئەگوزارەی ئێستای هەریەکەیان.
      </p>

      {reports === null && <p className="text-sm text-muted-foreground">بارکردن...</p>}
      {reports?.length === 0 && (
        <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          هیچ ڕاپۆرتێکت نەکردووە.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {reports?.map((r) => (
          <Link
            key={r.id}
            href={`/pin/${r.pinId}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 hover:bg-surface-hover"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
              {r.pinImageUrl && <Image src={r.pinImageUrl} alt="" fill className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.pinTitle ?? "پیلی سڕاوە"}</p>
              <p className="text-xs text-muted-foreground">هۆکار: {r.reasonLabel}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                r.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {r.status === "resolved" ? "چارەسەرکراوە" : "چاوەڕوانە"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
