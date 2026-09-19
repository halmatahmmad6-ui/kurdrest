"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Code2,
  Download,
  FlaskConical,
  HelpCircle,
  Languages,
  Link2,
  Lock,
  Megaphone,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, TranslationKey } from "@/lib/i18n";

interface Row {
  labelKey: TranslationKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainRows: Row[] = [
  { labelKey: "settings.row.settings", href: "/settings", icon: SettingsIcon },
  { labelKey: "settings.row.language", href: "/settings/language", icon: Languages },
  { labelKey: "settings.row.interests", href: "/settings/interests", icon: Sparkles },
  { labelKey: "settings.row.connections", href: "/settings/connections", icon: Link2 },
  { labelKey: "settings.row.reports", href: "/settings/reports", icon: ShieldAlert },
  { labelKey: "settings.row.install", href: "/settings/install", icon: Download },
  { labelKey: "settings.row.beta", href: "/settings/beta", icon: FlaskConical },
];

const supportRows: Row[] = [
  { labelKey: "settings.row.help", href: "/info/help", icon: HelpCircle },
  { labelKey: "settings.row.widget", href: "/settings/widget", icon: Code2 },
  { labelKey: "settings.row.removals", href: "/settings/removals", icon: Trash2 },
  { labelKey: "settings.row.ads", href: "/settings/ads", icon: Megaphone },
  { labelKey: "settings.row.privacyRights", href: "/settings/privacy-rights", icon: Lock },
  { labelKey: "settings.row.privacyPolicy", href: "/info/privacy-policy", icon: Lock },
  { labelKey: "settings.row.terms", href: "/info/terms", icon: SettingsIcon },
];

const resourceRows: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "settings.resource.about", href: "/info/about" },
  { labelKey: "settings.resource.blog", href: "/info/blog" },
  { labelKey: "settings.resource.business", href: "/info/business" },
  { labelKey: "settings.resource.careers", href: "/info/careers" },
  { labelKey: "settings.resource.developers", href: "/info/developers" },
];

function RowLink({ row }: { row: Row }) {
  const { t } = useLanguage();
  const Icon = row.icon;
  return (
    <Link
      href={row.href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-foreground/90 hover:bg-surface-hover"
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-foreground/70" />
      {t(row.labelKey)}
    </Link>
  );
}

export default function SettingsSupportHub() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
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
        <h1 className="font-display text-xl font-extrabold">{t("settings.title")}</h1>
      </div>

      <div className="mb-4 flex flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5">
        {mainRows.map((row) => (
          <RowLink key={row.href} row={row} />
        ))}
      </div>

      <p className="mb-2 mt-6 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("settings.section.support")}</p>
      <div className="mb-4 flex flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5">
        {supportRows.map((row) => (
          <RowLink key={row.href} row={row} />
        ))}
      </div>

      <p className="mb-2 mt-6 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("settings.section.resources")}</p>
      <div className="flex flex-wrap gap-x-1 gap-y-2 px-1 text-sm font-semibold text-brand-600">
        {resourceRows.map((r, i) => (
          <React.Fragment key={r.href}>
            <Link href={r.href} className="hover:underline">
              {t(r.labelKey)}
            </Link>
            {i < resourceRows.length - 1 && <span className="text-muted-foreground">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
