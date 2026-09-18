"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
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
      <h1 className="font-display text-2xl font-extrabold">چوونەژوورەوە</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        بۆ تاقیکردنەوە: ناوی بەکارهێنەر <code className="rounded bg-muted px-1">mirasolano</code> و وشەی نهێنی{" "}
        <code className="rounded bg-muted px-1">password123</code> (ئەدمین)
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">ئیمەیل یان ناوی بەکارهێنەر</label>
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
            placeholder="mirasolano"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">وشەی نهێنی</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "چاوەڕوانبە..." : "چوونەژوورەوە"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        هەژمارت نییە؟{" "}
        <Link href="/signup" className="font-semibold text-foreground underline underline-offset-2">
          تۆماربکە
        </Link>
      </p>
    </div>
  );
}
