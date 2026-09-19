"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import type { PublicPin } from "@/lib/types";

export default function CreateWidgetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pins, setPins] = React.useState<PublicPin[] | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    if (!user) return;
    fetch(`/api/users/${user.username}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setPins(data.pins ?? []);
        if (data.pins?.[0]) setSelectedId(data.pins[0].id);
      });
  }, [user]);

  if (loading || !user) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = selectedId
    ? `<iframe src="${origin}/embed/pin/${selectedId}" width="320" height="420" style="border:0;border-radius:16px;overflow:hidden;"></iframe>`
    : "";

  function handleCopy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">دروستکردنی ویجیت</h1>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        پیلێک هەڵبژێرە بۆ دروستکردنی کۆدێکی embed کە دەتوانیت لە هەر ماڵپەڕێکی تردا دایبنێیت.
      </p>

      {pins === null && <p className="text-sm text-muted-foreground">بارکردن...</p>}
      {pins?.length === 0 && <p className="text-sm text-muted-foreground">تۆ هێشتا هیچ پیلێکت بڵاونەکردووەتەوە.</p>}

      {pins && pins.length > 0 && (
        <>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mb-4 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ring"
          >
            {pins.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <div className="mb-3 flex items-center justify-between rounded-t-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
            کۆدی HTML
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "کۆپی کرا" : "کۆپیکردن"}
            </Button>
          </div>
          <pre className="mb-6 overflow-x-auto rounded-b-xl bg-foreground p-4 text-xs text-background">
            <code>{snippet}</code>
          </pre>

          {selectedId && (
            <iframe
              src={`/embed/pin/${selectedId}`}
              width="320"
              height="420"
              style={{ border: 0, borderRadius: 16, overflow: "hidden" }}
              title="Widget preview"
            />
          )}
        </>
      )}
    </div>
  );
}
