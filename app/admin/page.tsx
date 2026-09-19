"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeletePinDialog } from "@/components/delete-pin-dialog";
import { useAuth } from "@/lib/auth-context";
import { PublicAuthor } from "@/lib/types";
import { REPORT_REASONS, ReportReasonId } from "@/lib/db-types";
import { Flag, Trash2, Upload } from "lucide-react";

interface AdminUser extends PublicAuthor {
  role: "user" | "admin";
  email: string;
  followerIds: string[];
  followingIds: string[];
}
interface AdminPin {
  id: string;
  title: string;
  imageUrl: string;
  authorId: string;
  createdAt: string;
}
interface AdminReport {
  id: string;
  reason: ReportReasonId;
  createdAt: string;
  pin: { id: string; title: string; imageUrl: string; authorId: string } | null;
  reporter: { name: string; username: string } | null;
}
interface AdminAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  mediaType: "image" | "video";
  sponsor: string;
  linkUrl: string;
  aspectRatio: number;
  tags: string[];
  startDate?: string;
  endDate?: string;
}
interface AdminAdRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  sponsor: string;
  linkUrl: string;
  pin: { id: string; title: string; imageUrl: string; aspectRatio: number; tags: string[]; description: string } | null;
  requester: { id: string; name: string; username: string } | null;
}

const reasonLabel = (id: ReportReasonId) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [pins, setPins] = React.useState<AdminPin[]>([]);
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [ads, setAds] = React.useState<AdminAd[]>([]);
  const [adRequests, setAdRequests] = React.useState<AdminAdRequest[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminPin | null>(null);

  const load = React.useCallback(async () => {
    const [overviewRes, reportsRes, adsRes, adRequestsRes] = await Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/reports", { cache: "no-store" }),
      fetch("/api/admin/ads", { cache: "no-store" }),
      fetch("/api/admin/ad-requests?status=pending", { cache: "no-store" }),
    ]);
    if (overviewRes.ok) {
      const data = await overviewRes.json();
      setUsers(data.users);
      setPins(data.pins);
    }
    if (reportsRes.ok) {
      const data = await reportsRes.json();
      setReports(data.reports);
    }
    if (adsRes.ok) {
      const data = await adsRes.json();
      setAds(data.ads);
    }
    if (adRequestsRes.ok) {
      const data = await adRequestsRes.json();
      setAdRequests(data.requests);
    }
  }, []);

  React.useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/");
      return;
    }
    if (user?.role === "admin") load();
  }, [loading, user, router, load]);

  async function handleRoleToggle(u: AdminUser) {
    setBusyId(u.id);
    const nextRole = u.role === "admin" ? "user" : "admin";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (res.ok) setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    setBusyId(null);
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە؟ پیلەکانیشی دەسڕدرێنەوە.")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      load();
    }
    setBusyId(null);
  }

  async function handleConfirmDeletePin(note?: string) {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/pins/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) {
      setPins((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setReports((prev) => prev.filter((r) => r.pin?.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  async function handleDismissReport(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/reports/${id}`, { method: "PATCH" });
    if (res.ok) setReports((prev) => prev.filter((r) => r.id !== id));
    setBusyId(null);
  }

  async function handleCreateAd(input: {
    title: string;
    description: string;
    imageUrl: string;
    mediaType: "image" | "video";
    aspectRatio: number;
    sponsor: string;
    linkUrl: string;
    tags: string[];
    startDate?: string;
    endDate?: string;
  }) {
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = await res.json();
      setAds((prev) => [...prev, data.ad]);
    }
    return res.ok;
  }

  async function handleDeleteAd(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم ڕیکلامە؟")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    if (res.ok) setAds((prev) => prev.filter((a) => a.id !== id));
    setBusyId(null);
  }

  async function handleApproveAdRequest(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/ad-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) {
      const data = await res.json();
      setAdRequests((prev) => prev.filter((r) => r.id !== id));
      setAds((prev) => [...prev, data.ad]);
    }
    setBusyId(null);
  }

  async function handleRejectAdRequest(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/ad-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    if (res.ok) setAdRequests((prev) => prev.filter((r) => r.id !== id));
    setBusyId(null);
  }

  if (loading || !user || user.role !== "admin") return null;

  const authorName = (authorId: string) => users.find((u) => u.id === authorId)?.name ?? "—";

  return (
    <div className="py-6">
      <h1 className="mb-6 font-display text-2xl font-extrabold">بەڕێوەبردنی ماڵپەڕ</h1>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">ڕاپۆرتەکان ({reports.length})</TabsTrigger>
          <TabsTrigger value="ad-requests">داواکاری ڕیکلام ({adRequests.length})</TabsTrigger>
          <TabsTrigger value="users">بەکارهێنەران ({users.length})</TabsTrigger>
          <TabsTrigger value="pins">پیلەکان ({pins.length})</TabsTrigger>
          <TabsTrigger value="ads">ڕیکلامەکان ({ads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          {reports.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">هیچ ڕاپۆرتێکی چاوەڕوان نییە.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border p-3">
                  {r.pin ? (
                    <Link href={`/pin/${r.pin.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={r.pin.imageUrl} alt={r.pin.title} fill sizes="64px" className="object-cover" />
                    </Link>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Flag className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {r.pin ? r.pin.title : "پیلەکە پێشتر سڕدراوەتەوە"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      هۆکار: <span className="font-medium text-foreground">{reasonLabel(r.reason)}</span>
                      {r.reporter && <> · لەلایەن @{r.reporter.username}</>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => handleDismissReport(r.id)}>
                      پشتگوێخستن
                    </Button>
                    {r.pin && (
                      <Button
                        size="sm"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() =>
                          setDeleteTarget({ id: r.pin!.id, title: r.pin!.title, imageUrl: r.pin!.imageUrl, authorId: r.pin!.authorId, createdAt: "" })
                        }
                      >
                        سڕینەوەی پیل
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ad-requests">
          {adRequests.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">هیچ داواکارییەکی چاوەڕوان نییە.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {adRequests.map((r) => (
                <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border p-3">
                  {r.pin ? (
                    <Link href={`/pin/${r.pin.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={r.pin.imageUrl} alt={r.pin.title} fill sizes="64px" className="object-cover" />
                    </Link>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Flag className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.pin ? r.pin.title : "پیلەکە سڕاوەتەوە"}</p>
                    <p className="text-xs text-muted-foreground">
                      داواکراوە لەلایەن {r.requester ? `@${r.requester.username}` : "؟"} · بازرگان:{" "}
                      <span className="font-medium text-foreground">{r.sponsor}</span>
                    </p>
                    <a href={r.linkUrl} target="_blank" rel="noopener" className="truncate text-xs text-brand-600 hover:underline">
                      {r.linkUrl}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => handleRejectAdRequest(r.id)}>
                      ڕەتکردنەوە
                    </Button>
                    <Button size="sm" disabled={busyId === r.id} onClick={() => handleApproveAdRequest(r.id)}>
                      پەسەندکردن
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">بەکارهێنەر</th>
                  <th className="p-3">ئیمەیل</th>
                  <th className="p-3">ڕۆڵ</th>
                  <th className="p-3 text-right">کردار</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <Link href={`/profile/${u.username}`} className="flex items-center gap-2 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatarUrl} alt={u.name} />
                          <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.name}</span>
                        <span className="text-muted-foreground">@{u.username}</span>
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className={u.role === "admin" ? "font-semibold text-brand-600" : "text-muted-foreground"}>
                        {u.role === "admin" ? "ئەدمین" : "بەکارهێنەر"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" disabled={busyId === u.id || u.id === user.id} onClick={() => handleRoleToggle(u)}>
                          {u.role === "admin" ? "لابردنی ئەدمین" : "کردن بە ئەدمین"}
                        </Button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={busyId === u.id || u.id === user.id}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-40"
                          aria-label="سڕینەوە"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pins">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pins.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-border">
                <Link href={`/pin/${p.id}`} className="relative block aspect-square bg-muted">
                  <Image src={p.imageUrl} alt={p.title} fill sizes="25vw" className="object-cover" />
                </Link>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{authorName(p.authorId)}</p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    aria-label="سڕینەوە"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ads">
          <AdComposer onCreate={handleCreateAd} />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ads.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-2xl border border-border">
                <div className="relative block aspect-square bg-muted">
                  {a.mediaType === "video" ? (
                    <video src={a.imageUrl} muted loop playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Image src={a.imageUrl} alt={a.title} fill sizes="25vw" className="object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.sponsor}</p>
                    {(a.startDate || a.endDate) && (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {a.startDate ?? "…"} — {a.endDate ?? "…"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAd(a.id)}
                    disabled={busyId === a.id}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-40"
                    aria-label="سڕینەوە"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-muted-foreground">هیچ ڕیکلامێک زیاد نەکراوە.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DeletePinDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        showNoteField={!!deleteTarget && deleteTarget.authorId !== user.id}
        onConfirm={handleConfirmDeletePin}
      />
    </div>
  );
}

/** Reads a locally picked file to figure out whether it's an image or video and its natural aspect ratio. */
function loadAdMediaMeta(file: File): Promise<{ aspectRatio: number; mediaType: "image" | "video" }> {
  const isVideo = file.type.startsWith("video/");
  const url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    if (isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({ aspectRatio: (video.videoHeight || 1) / (video.videoWidth || 1), mediaType: "video" });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => resolve({ aspectRatio: 1, mediaType: "video" });
      video.src = url;
    } else {
      const img = new window.Image();
      img.onload = () => {
        resolve({ aspectRatio: (img.naturalHeight || 1) / (img.naturalWidth || 1), mediaType: "image" });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => resolve({ aspectRatio: 1, mediaType: "image" });
      img.src = url;
    }
  });
}

function AdComposer({
  onCreate,
}: {
  onCreate: (input: {
    title: string;
    description: string;
    imageUrl: string;
    mediaType: "image" | "video";
    aspectRatio: number;
    sponsor: string;
    linkUrl: string;
    tags: string[];
    startDate?: string;
    endDate?: string;
  }) => Promise<boolean>;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sponsor, setSponsor] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [mediaType, setMediaType] = React.useState<"image" | "video">("image");
  const [aspectRatio, setAspectRatio] = React.useState(1.2);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const meta = await loadAdMediaMeta(file);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
        setMediaType(meta.mediaType);
        setAspectRatio(meta.aspectRatio || 1.2);
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || !imageUrl || !sponsor || !linkUrl) {
      setError("ناونیشان، وێنە/ڤیدیۆ، بازرگان و بەستەر پێویستن.");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError("بەرواری بەسەرچوون نابێت پێش بەرواری دەستپێک بێت.");
      return;
    }
    setSaving(true);
    try {
      const ok = await onCreate({
        title,
        description,
        imageUrl,
        mediaType,
        aspectRatio,
        sponsor,
        linkUrl,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (ok) {
        setTitle("");
        setDescription("");
        setSponsor("");
        setLinkUrl("");
        setTags("");
        setImageUrl("");
        setMediaType("image");
        setAspectRatio(1.2);
        setStartDate("");
        setEndDate("");
      } else {
        setError("دروستکردنی ڕیکلام سەرکەوتوو نەبوو.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-4">
      <p className="mb-3 text-sm font-semibold">زیادکردنی ڕیکلامی نوێ</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ناونیشان"
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ring"
        />
        <input
          value={sponsor}
          onChange={(e) => setSponsor(e.target.value)}
          placeholder="ناوی بازرگان"
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ring"
        />
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="بەستەر (https://...)"
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ring sm:col-span-2"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="تاگەکان، بەکۆما جیاکراوە"
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-ring sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وەسف"
          rows={2}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-ring sm:col-span-2"
        />
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          بەرواری دەستپێک
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          بەرواری بەسەرچوون
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-ring"
          />
        </label>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div className="mt-3 flex items-center gap-3">
        <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {uploading ? "ئەپلۆدکردن..." : imageUrl ? "گۆڕینی وێنە/ڤیدیۆ" : "هەڵبژاردنی وێنە یان ڤیدیۆ"}
        </Button>
        {imageUrl && (
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
            {mediaType === "video" ? (
              <video src={imageUrl} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image src={imageUrl} alt="" fill className="object-cover" />
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" size="sm" className="mt-3" disabled={saving}>
        {saving ? "زیادکردن..." : "زیادکردنی ڕیکلام"}
      </Button>
    </form>
  );
}
