"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = React.useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "هەڵەیەک ڕوویدا لە سێرڤەرەوە. تکایە دووبارە هەوڵبدەرەوە.");
        return;
      }
      await refresh();
      router.push("/");
      router.refresh();
    } catch {
      setError("نەتوانرا پەیوەندی بە سێرڤەرەوە بکرێت. تکایە دووبارە هەوڵبدەرەوە.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col py-10">
      <h1 className="font-display text-2xl font-extrabold">دروستکردنی هەژمار</h1>
      <p className="mt-1 text-sm text-muted-foreground">خۆت تۆماربکە بۆ ئەپلۆدکردنی وێنە و پرۆفایلی تایبەت.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">ناوی تەواو</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">ناوی بەکارهێنەر</label>
          <input
            required
            value={form.username}
            onChange={(e) => update("username", e.target.value.toLowerCase())}
            pattern="[a-z0-9_.]{3,20}"
            title="پیتی لاتینی بچووک، ژمارە، _ یان . — لە نێوان ٣ تا ٢٠ پیت"
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">ئیمەیل</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">وشەی نهێنی</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "چاوەڕوانبە..." : "تۆمارکردن"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        هەژمارت هەیە؟{" "}
        <Link href="/login" className="font-semibold text-foreground underline underline-offset-2">
          چوونەژوورەوە
        </Link>
      </p>
    </div>
  );
}
