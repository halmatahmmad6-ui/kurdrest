"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";

export default function SettingsPage() {
  const { user, loading, refresh, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user) {
      setName(user.name);
      setBio(user.bio ?? "");
      setAvatarUrl(user.avatarUrl);
    }
  }, [user, loading, router]);

  async function handleAvatarChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setAvatarUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarUrl }),
      });
      if (res.ok) {
        await refresh();
        setMessage(t("profile.saved"));
        router.refresh();
      } else {
        setMessage(t("profile.saveFailed"));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="mx-auto max-w-lg py-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold">{t("profile.title")}</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"
              aria-label={t("profile.changeAvatar")}
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
            />
          </div>
          {uploading && <p className="text-sm text-muted-foreground">{t("profile.uploading")}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("profile.name")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("profile.bio")}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-ring focus:bg-surface"
          />
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? t("profile.saving") : t("profile.save")}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <Button variant="outline" onClick={() => logout()}>
          {t("profile.logout")}
        </Button>
      </div>
    </div>
  );
}
