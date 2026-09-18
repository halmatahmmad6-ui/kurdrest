"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Compass, Home, Plus, Search, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationsMenu } from "@/components/notifications-menu";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center gap-3">
        {/* Brand — swap the mark and name here to rebrand */}
        <Link href="/" className="mr-1 flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Kurd Rest" className="h-9 w-9 rounded-full object-cover" />
          <span className="hidden font-display text-lg font-extrabold tracking-tight sm:inline">
            Kurd Rest
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Native GET form — submitting takes the user to /explore?q=... */}
        <form action="/explore" className="relative ml-1 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="گەڕان بۆ بیرۆکە"
            aria-label="گەڕان"
            className={cn(
              "h-11 w-full rounded-full border border-transparent bg-muted pl-11 pr-4 text-sm outline-none transition-colors",
              "placeholder:text-muted-foreground focus:border-ring focus:bg-surface"
            )}
          />
        </form>

        {loading ? (
          <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <>
            <Link href="/create">
              <Button size="icon" variant="dark" className="shrink-0" aria-label="زیادکردنی وێنە">
                <Plus className="h-5 w-5" />
              </Button>
            </Link>

            <NotificationsMenu />

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="shrink-0 rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="مینوی پرۆفایل"
                >
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={10}
                  className="z-50 w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-card-hover animate-scale-in"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href={`/profile/${user.username}`}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
                    >
                      پرۆفایلەکەم
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
                    >
                      ڕێکخستنەکان
                    </Link>
                  </DropdownMenu.Item>
                  {user.role === "admin" && (
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/admin"
                        className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-surface-hover"
                      >
                        <ShieldCheck className="h-4 w-4" /> بەڕێوەبردنی ماڵپەڕ
                      </Link>
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    onSelect={() => logout()}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive outline-none hover:bg-surface-hover"
                  >
                    چوونەدەرەوە
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login">
              <Button variant="secondary" size="sm">چوونەژوورەوە</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">تۆمارکردن</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
