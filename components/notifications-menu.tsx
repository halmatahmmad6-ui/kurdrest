"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, Heart, MessageCircle, Bookmark, UserPlus, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "like" | "save" | "comment" | "follow" | "removed";
  read: boolean;
  createdAt: string;
  message?: string;
  actor: { name: string; username: string; avatarUrl: string } | null;
  pin: { id: string; title: string; imageUrl: string } | null;
}

const ICONS = { like: Heart, save: Bookmark, comment: MessageCircle, follow: UserPlus, removed: ShieldAlert };
const LABELS = {
  like: "پسندی کرد",
  save: "پیلەکەت هەڵگرت",
  comment: "کۆمێنتی کرد لەسەر",
  follow: "دوایت کەوت",
  removed: "پیلێکی تۆی سڕییەوە",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ئێستا";
  if (mins < 60) return `${mins} خولەک`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} کاتژمێر`;
  return `${Math.floor(hours / 24)} ڕۆژ`;
}

export function NotificationsMenu() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications);
    setUnread(data.unreadCount);
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-hover sm:flex" aria-label="ئاگادارکردنەوەکان">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-brand-foreground">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-card-hover animate-scale-in"
        >
          <p className="px-2 py-1.5 text-sm font-bold">ئاگادارکردنەوەکان</p>
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">هیچ ئاگادارکردنەوەیەک نییە.</p>
          ) : (
            items.map((n) => {
              const Icon = ICONS[n.type];
              const content = (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 hover:bg-surface-hover",
                    !n.read && "bg-brand-50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={n.actor?.avatarUrl} alt={n.actor?.name} />
                      <AvatarFallback>{n.actor?.name?.slice(0, 1) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    {n.type === "removed" ? (
                      <span className="font-semibold text-destructive">{LABELS.removed}</span>
                    ) : (
                      <>
                        <span className="font-semibold">{n.actor?.name}</span> {LABELS[n.type]}
                        {n.pin && <span className="text-muted-foreground"> "{n.pin.title}"</span>}
                      </>
                    )}
                    {n.message && <p className="mt-0.5 text-xs italic text-muted-foreground">"{n.message}"</p>}
                    <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                  {n.pin && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.pin.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              );
              return n.pin ? (
                <Link key={n.id} href={`/pin/${n.pin.id}`}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
