"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function InstallAppPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [installEvent, setInstallEvent] = React.useState<any>(null);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  React.useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover" aria-label="گەڕانەوە">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">دامەزراندنی ئەپەکە</h1>
      </div>

      {installed && (
        <p className="mb-4 rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-700">
          ئەپەکە بە سەرکەوتوویی دامەزرا! ✓
        </p>
      )}

      {installEvent ? (
        <Button onClick={handleInstall}>
          <Download className="h-4 w-4" /> دامەزراندنی Kurd Rest
        </Button>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">وێبگەڕەکەت دیاریکراوی دامەزراندنی خۆکاری پیشان نادات.</p>
          <p>دەتوانیت بە دەستی ئەم ماڵپەڕە دابمەزرێنیت:</p>
          <ul className="mt-2 list-disc pr-5">
            <li>Chrome/Edge: کرتە لەسەر ⋮ بکە ← "Install app" یان دامەزراندنی ئەپ</li>
            <li>Safari (iOS): دوگمەی هاوبەشکردن ← "Add to Home Screen"</li>
          </ul>
        </div>
      )}
    </div>
  );
}
