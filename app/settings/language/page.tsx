"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, LOCALES, LOCALE_META } from "@/lib/i18n";

export default function LanguageSettingsPage() {
  const { user, loading } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-hover"
          aria-label={t("settings.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-extrabold">{t("language.title")}</h1>
      </div>

      <div className="mb-6 flex justify-center">
        <Image src="/icons/language.png" alt="" width={96} height={96} priority />
      </div>

      <p className="mb-4 px-1 text-sm text-muted-foreground">{t("language.description")}</p>

      <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5">
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-foreground/90 hover:bg-surface-hover"
            >
              <span>{LOCALE_META[code].name}</span>
              {active && <Check className="h-[18px] w-[18px] text-brand-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
