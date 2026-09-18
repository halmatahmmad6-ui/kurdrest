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
import { Flag, Trash2 } from "lucide-react";

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

const reasonLabel = (id: ReportReasonId) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [pins, setPins] = React.useState<AdminPin[]>([]);
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminPin | null>(null);

  const load = React.useCallback(async () => {
    const [overviewRes, reportsRes] = await Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/reports", { cache: "no-store" }),
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

  if (loading || !user || user.role !== "admin") return null;

  const authorName = (authorId: string) => users.find((u) => u.id === authorId)?.name ?? "—";

  return (
    <div className="py-6">
      <h1 className="mb-6 font-display text-2xl font-extrabold">بەڕێوەبردنی ماڵپەڕ</h1>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">ڕاپۆرتەکان ({reports.length})</TabsTrigger>
          <TabsTrigger value="users">بەکارهێنەران ({users.length})</TabsTrigger>
          <TabsTrigger value="pins">پیلەکان ({pins.length})</TabsTrigger>
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
