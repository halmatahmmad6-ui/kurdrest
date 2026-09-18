"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasonryGrid } from "@/components/masonry-grid";
import { PinModal } from "@/components/pin-modal";
import { useAuth } from "@/lib/auth-context";
import { Pin, PublicAuthor, PublicBoard } from "@/lib/types";
import { Lock, Settings } from "lucide-react";

interface ProfileData {
  user: PublicAuthor & { bio: string };
  pins: Pin[];
  boards: PublicBoard[];
  isSelf: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { user: viewer } = useAuth();

  const [data, setData] = React.useState<ProfileData | null>(null);
  const [notFoundFlag, setNotFoundFlag] = React.useState(false);
  const [following, setFollowing] = React.useState(false);
  const [selectedPin, setSelectedPin] = React.useState<Pin | null>(null);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/users/${params.username}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFoundFlag(true);
      return;
    }
    const json: ProfileData = await res.json();
    setData(json);
    setFollowing(json.isFollowing);
  }, [params.username]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggleFollow() {
    if (!viewer) return router.push("/login");
    setFollowing((f) => !f);
    const res = await fetch(`/api/users/${params.username}/follow`, { method: "POST" });
    if (!res.ok) setFollowing((f) => !f); // revert on failure
  }

  function removePin(id: string) {
    setData((prev) => (prev ? { ...prev, pins: prev.pins.filter((p) => p.id !== id) } : prev));
  }

  if (notFoundFlag) {
    return <p className="py-16 text-center text-muted-foreground">ئەم بەکارهێنەرە نەدۆزرایەوە.</p>;
  }
  if (!data) return null;

  const { user, pins, boards, isSelf, followerCount, followingCount } = data;

  return (
    <div>
      <div className="flex flex-col items-center py-8 text-center">
        <Avatar className="h-28 w-28">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 font-display text-2xl font-extrabold">{user.name}</h1>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio && <p className="mt-3 max-w-md text-sm text-foreground/80">{user.bio}</p>}

        <div className="mt-4 flex items-center gap-5 text-sm">
          <span><span className="font-semibold">{followerCount}</span> <span className="text-muted-foreground">شوێنکەوتوو</span></span>
          <span><span className="font-semibold">{followingCount}</span> <span className="text-muted-foreground">شوێنکەوتن</span></span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {isSelf ? (
            <Link href="/settings">
              <Button variant="secondary" size="icon" aria-label="ڕێکخستنەکان">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant={following ? "secondary" : "dark"} onClick={toggleFollow}>
              {following ? "شوێنکەوتووی" : "شوێنکەوتن"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="created" className="flex flex-col items-center">
        <TabsList>
          <TabsTrigger value="created">دروستکراوەکان</TabsTrigger>
          <TabsTrigger value="boards">بۆردەکان</TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="w-full">
          {pins.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ پیلێک دروست نەکراوە.</p>
          ) : (
            <MasonryGrid
              pins={pins}
              onOpenPin={(pin) => {
                setSelectedPin(pin);
                setOpen(true);
              }}
              onRemovePin={removePin}
            />
          )}
        </TabsContent>

        <TabsContent value="boards" className="w-full">
          {boards.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">هێشتا هیچ بۆردێک نییە.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {boards.map((board) => (
                <div key={board.id} className="text-left">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                    <Image src={board.coverImageUrl} alt={board.name} fill sizes="25vw" className="object-cover" />
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                    {board.name}
                    {board.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{board.pinCount} پیل</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PinModal
        pin={selectedPin}
        open={open}
        onOpenChange={setOpen}
        onRemove={() => selectedPin && removePin(selectedPin.id)}
      />
    </div>
  );
}
