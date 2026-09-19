"use client";

import * as React from "react";

/** Every language the site can be switched to. Kurdish (Sorani) is the original/default. */
export const LOCALES = ["ku", "ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { name: string; dir: "rtl" | "ltr" }> = {
  ku: { name: "کوردی", dir: "rtl" },
  ar: { name: "العربية", dir: "rtl" },
  en: { name: "English", dir: "ltr" },
};

/**
 * Central translation dictionary. Add a key here once, then use it anywhere
 * with `t("key")`. Keys are grouped by the area of the site they belong to —
 * extend this object to translate more of the site.
 */
const dict = {
  // Navbar
  "nav.home": { ku: "سەرەکی", ar: "الرئيسية", en: "Home" },
  "nav.explore": { ku: "گەڕان", ar: "استكشاف", en: "Explore" },
  "nav.searchPlaceholder": { ku: "گەڕان بۆ بیرۆکە", ar: "ابحث عن فكرة", en: "Search for ideas" },
  "nav.search": { ku: "گەڕان", ar: "بحث", en: "Search" },
  "nav.createPin": { ku: "زیادکردنی وێنە", ar: "إضافة صورة", en: "Create pin" },
  "nav.profileMenu": { ku: "مینوی پرۆفایل", ar: "قائمة الملف الشخصي", en: "Profile menu" },
  "nav.myProfile": { ku: "پرۆفایلەکەم", ar: "ملفي الشخصي", en: "My profile" },
  "nav.settingsSupport": { ku: "ڕێکخستن و پشتگیری", ar: "الإعدادات والدعم", en: "Settings & support" },
  "nav.admin": { ku: "بەڕێوەبردنی ماڵپەڕ", ar: "إدارة الموقع", en: "Site administration" },
  "nav.logout": { ku: "چوونەدەرەوە", ar: "تسجيل الخروج", en: "Log out" },
  "nav.login": { ku: "چوونەژوورەوە", ar: "تسجيل الدخول", en: "Log in" },
  "nav.signup": { ku: "تۆمارکردن", ar: "إنشاء حساب", en: "Sign up" },

  // Settings hub
  "settings.title": { ku: "ڕێکخستن و پشتگیری", ar: "الإعدادات والدعم", en: "Settings & support" },
  "settings.back": { ku: "گەڕانەوە", ar: "رجوع", en: "Back" },
  "settings.section.support": { ku: "پشتگیری", ar: "الدعم", en: "Support" },
  "settings.section.resources": { ku: "سەرچاوەکان", ar: "الموارد", en: "Resources" },
  "settings.row.settings": { ku: "ڕێکخستنەکان", ar: "الإعدادات", en: "Settings" },
  "settings.row.language": { ku: "زمان", ar: "اللغة", en: "Language" },
  "settings.row.interests": { ku: "باشترکردنی پێشنیارەکانت", ar: "تحسين اقتراحاتك", en: "Refine your recommendations" },
  "settings.row.connections": { ku: "بەستنەوە بە هەژمارەکانی تر", ar: "الربط مع حسابات أخرى", en: "Connected accounts" },
  "settings.row.reports": { ku: "ناوەندی ڕاپۆرت و پێشێلکاری", ar: "مركز التقارير والمخالفات", en: "Reports & violations" },
  "settings.row.install": { ku: "دامەزراندنی ئەپەکە", ar: "تثبيت التطبيق", en: "Install the app" },
  "settings.row.beta": { ku: "بوون بە تاقیکەرەوەی بیتا", ar: "الانضمام لتجربة النسخة التجريبية", en: "Join the beta" },
  "settings.row.help": { ku: "ناوەندی یارمەتی", ar: "مركز المساعدة", en: "Help center" },
  "settings.row.widget": { ku: "دروستکردنی ویجیت", ar: "إنشاء ويدجت", en: "Create a widget" },
  "settings.row.removals": { ku: "سڕینەوەکان", ar: "الحذوفات", en: "Removals" },
  "settings.row.ads": { ku: "ڕیکلامی کەسیکراو", ar: "الإعلانات المخصصة", en: "Personalized ads" },
  "settings.row.privacyRights": { ku: "مافەکانی تایبەتیت", ar: "حقوق الخصوصية", en: "Your privacy rights" },
  "settings.row.privacyPolicy": { ku: "سیاسەتی تایبەتێتی", ar: "سياسة الخصوصية", en: "Privacy policy" },
  "settings.row.terms": { ku: "مەرجەکانی خزمەتگوزاری", ar: "شروط الخدمة", en: "Terms of service" },
  "settings.resource.about": { ku: "دەربارە", ar: "حول", en: "About" },
  "settings.resource.blog": { ku: "بلۆگ", ar: "المدونة", en: "Blog" },
  "settings.resource.business": { ku: "بۆ بازرگانان", ar: "للأعمال", en: "For business" },
  "settings.resource.careers": { ku: "کارکردن لەگەڵمان", ar: "الوظائف", en: "Careers" },
  "settings.resource.developers": { ku: "گەشەپێدەران", ar: "المطورون", en: "Developers" },

  // Profile settings page
  "profile.title": { ku: "ڕێکخستنەکانی پرۆفایل", ar: "إعدادات الملف الشخصي", en: "Profile settings" },
  "profile.changeAvatar": { ku: "گۆڕینی وێنەی پرۆفایل", ar: "تغيير الصورة الشخصية", en: "Change profile photo" },
  "profile.uploading": { ku: "ئەپلۆدکردن...", ar: "جارٍ الرفع...", en: "Uploading..." },
  "profile.name": { ku: "ناو", ar: "الاسم", en: "Name" },
  "profile.bio": { ku: "بایۆگرافیا", ar: "نبذة تعريفية", en: "Bio" },
  "profile.save": { ku: "پاشەکەوتکردن", ar: "حفظ", en: "Save" },
  "profile.saving": { ku: "پاشەکەوتکردن...", ar: "جارٍ الحفظ...", en: "Saving..." },
  "profile.saved": { ku: "گۆڕانکاریەکان پاشەکەوتکران.", ar: "تم حفظ التغييرات.", en: "Changes saved." },
  "profile.saveFailed": { ku: "پاشەکەوتکردن سەرکەوتوو نەبوو.", ar: "فشل الحفظ.", en: "Save failed." },
  "profile.logout": { ku: "چوونەدەرەوە", ar: "تسجيل الخروج", en: "Log out" },

  // Language settings page
  "language.title": { ku: "زمانی ماڵپەڕ", ar: "لغة الموقع", en: "Site language" },
  "language.description": {
    ku: "زمانێک هەڵبژێرە؛ دەقەکانی ماڵپەڕ دەستبەجێ دەگۆڕدرێت بۆ هەمان زمان.",
    ar: "اختر لغة؛ سيتم تغيير نصوص الموقع فورًا إلى نفس اللغة.",
    en: "Choose a language; the site's text switches to it right away.",
  },
  "language.current": { ku: "زمانی ئێستا", ar: "اللغة الحالية", en: "Current language" },
} as const;

export type TranslationKey = keyof typeof dict;

const STORAGE_KEY = "site-locale";
const DEFAULT_LOCALE: Locale = "ku";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = LOCALE_META[locale].dir;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  // Load the saved choice once on mount, then keep <html lang/dir> in sync.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    const initial = stored && LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
    setLocaleState(initial);
    applyDocumentLocale(initial);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDocumentLocale(next);
  }, []);

  const t = React.useCallback(
    (key: TranslationKey) => dict[key]?.[locale] ?? dict[key]?.[DEFAULT_LOCALE] ?? key,
    [locale]
  );

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
