import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import {
  DBBoard,
  DBComment,
  DBNotification,
  DBPin,
  DBReport,
  DBShape,
  DBUser,
  NotificationType,
  ReportReasonId,
  toPublicUser,
} from "./db-types";
import { PublicComment, PublicPin } from "./types";

/**
 * DEMO DATABASE — a JSON file on disk, not a real database.
 *
 * This is intentionally simple so the app is runnable with zero external
 * services. It works great for `npm run dev` / a single long-running
 * `npm start` process. It will NOT work on serverless hosts (Vercel, etc.)
 * because their filesystem is read-only/ephemeral per request — for
 * production, swap the functions in this file for calls to a real database
 * (Postgres + Prisma, SQLite, MongoDB, Supabase, ...) while keeping the same
 * function signatures so nothing else in the app has to change.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function seed(): DBShape {
  const now = () => new Date().toISOString();

  const rawUsers: Array<Omit<DBUser, "passwordHash" | "id" | "followerIds" | "followingIds" | "createdAt"> & { password: string }> = [
    { name: "Mira Solano", username: "mirasolano", email: "mira@example.com", password: "password123", avatarUrl: "https://i.pravatar.cc/150?img=32", bio: "Collecting quiet interiors, good type, and slow mornings.", role: "admin" },
    { name: "Kenji Ito", username: "kenjidesigns", email: "kenji@example.com", password: "password123", avatarUrl: "https://i.pravatar.cc/150?img=12", bio: "Type & product design.", role: "user" },
    { name: "Aster Vale", username: "astervale", email: "aster@example.com", password: "password123", avatarUrl: "https://i.pravatar.cc/150?img=47", bio: "Photographer, always traveling.", role: "user" },
    { name: "Priya Nandan", username: "priyan", email: "priya@example.com", password: "password123", avatarUrl: "https://i.pravatar.cc/150?img=5", bio: "Food, ceramics, slow living.", role: "user" },
    { name: "Theo Marks", username: "theomarks", email: "theo@example.com", password: "password123", avatarUrl: "https://i.pravatar.cc/150?img=68", bio: "Furniture restoration.", role: "user" },
  ];

  const users: DBUser[] = rawUsers.map((u) => ({
    id: uuid(),
    name: u.name,
    username: u.username,
    email: u.email,
    passwordHash: bcrypt.hashSync(u.password, 10),
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    role: u.role,
    followerIds: [],
    followingIds: [],
    createdAt: now(),
  }));

  const byUsername = (username: string) => users.find((u) => u.username === username)!;
  byUsername("mirasolano").followerIds = [byUsername("kenjidesigns").id, byUsername("priyan").id];
  byUsername("mirasolano").followingIds = [byUsername("astervale").id];

  const images: { url: string; ratio: number }[] = [
    { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", ratio: 1.4 },
    { url: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800", ratio: 0.75 },
    { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800", ratio: 1.2 },
    { url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800", ratio: 1.5 },
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", ratio: 0.8 },
    { url: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=800", ratio: 1.1 },
    { url: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800", ratio: 1.3 },
    { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", ratio: 0.7 },
    { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800", ratio: 1.6 },
    { url: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?w=800", ratio: 0.9 },
    { url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800", ratio: 1.25 },
    { url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800", ratio: 1.0 },
  ];
  const titles = [
    "Minimalist studio apartment tour", "Terracotta pots & desert plants", "Hand-thrown ceramics, morning light",
    "Coastal cabin renovation, before/after", "Autumn palette wardrobe edit", "Type-driven poster series",
    "Slow travel: backroads of Kyoto", "Weeknight pasta, five ingredients", "Botanical illustration sketchbook",
    "Mid-century chair restoration", "Golden hour portrait lighting setup", "Concrete & timber reading nook",
  ];
  const tagPool = ["interior", "design", "minimal", "travel", "food", "typography", "ceramics", "fashion", "photography", "diy", "architecture", "nature"];
  const pick = <T,>(arr: T[], seedN: number) => arr[seedN % arr.length];

  const pins: DBPin[] = Array.from({ length: 24 }).map((_, i) => {
    const img = pick(images, i);
    const author = pick(users, i + 2);
    return {
      id: uuid(),
      title: pick(titles, i),
      description: "A closer look at the details, materials, and process behind this piece — saved for reference and reworked over a few weekends.",
      mediaType: "image",
      imageUrl: img.url,
      aspectRatio: img.ratio,
      authorId: author.id,
      tags: [pick(tagPool, i), pick(tagPool, i + 3), pick(tagPool, i + 5)],
      likedBy: [],
      savedBy: [],
      comments: [],
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    };
  });

  const boards: DBBoard[] = [
    { id: uuid(), ownerId: byUsername("mirasolano").id, name: "Home & Interiors", coverImageUrl: images[0].url, pinIds: pins.slice(0, 4).map((p) => p.id), isPrivate: false },
    { id: uuid(), ownerId: byUsername("mirasolano").id, name: "Style Inspiration", coverImageUrl: images[4].url, pinIds: pins.slice(4, 6).map((p) => p.id), isPrivate: false },
    { id: uuid(), ownerId: byUsername("mirasolano").id, name: "Travel Ideas", coverImageUrl: images[6].url, pinIds: pins.slice(6, 8).map((p) => p.id), isPrivate: true },
  ];

  return { users, pins, boards, notifications: [], reports: [] };
}

/**
 * In-memory fallback cache.
 *
 * Some hosts (serverless platforms, certain preview/sandbox environments)
 * run the app with a read-only or fully ephemeral filesystem. In that case
 * `fs.writeFileSync` below throws, which used to crash the whole request:
 * signup/login would fail with a raw server error, the frontend couldn't
 * parse it as JSON, and the user was left looking "not logged in" with no
 * visible error. Now a failed disk write falls back to keeping the data in
 * memory for the life of this server process, so signup/login/etc. keep
 * working even when nothing can be persisted to disk (it just won't
 * survive a full restart on those hosts — same limitation described in
 * the file-level comment above).
 */
let memoryDB: DBShape | null = null;

function ensureDataFile(): DBShape {
  if (memoryDB) return memoryDB;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      const initial = seed();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as DBShape;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[db] Filesystem is not writable/readable, falling back to in-memory data:", err);
    memoryDB = seed();
    return memoryDB;
  }
}

function readDB(): DBShape {
  return ensureDataFile();
}

function writeDB(db: DBShape) {
  if (memoryDB) {
    // Already on the in-memory fallback for this process — stay there
    // instead of retrying a disk write that's already been shown to fail.
    memoryDB = db;
    return;
  }
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[db] Could not write to disk, switching to in-memory data for this session:", err);
    memoryDB = db;
  }
}

/* ---------------------------- Users ---------------------------- */

export function getUsers(): DBUser[] {
  return readDB().users;
}
export function findUserById(id: string): DBUser | undefined {
  return readDB().users.find((u) => u.id === id);
}
export function findUserByUsername(username: string): DBUser | undefined {
  return readDB().users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}
export function findUserByEmail(email: string): DBUser | undefined {
  return readDB().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(input: { name: string; username: string; email: string; password: string }): DBUser {
  const db = readDB();
  const user: DBUser = {
    id: uuid(),
    name: input.name,
    username: input.username,
    email: input.email,
    passwordHash: bcrypt.hashSync(input.password, 10),
    avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(input.username)}`,
    bio: "",
    role: db.users.length === 0 ? "admin" : "user",
    followerIds: [],
    followingIds: [],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDB(db);
  return user;
}

export function updateUser(id: string, patch: Partial<Pick<DBUser, "name" | "bio" | "avatarUrl" | "role">>): DBUser | undefined {
  const db = readDB();
  const user = db.users.find((u) => u.id === id);
  if (!user) return undefined;
  Object.assign(user, patch);
  writeDB(db);
  return user;
}

export function deleteUser(id: string) {
  const db = readDB();
  db.users = db.users.filter((u) => u.id !== id);
  db.pins = db.pins.filter((p) => p.authorId !== id);
  writeDB(db);
}

export function toggleFollow(followerId: string, targetUsername: string): { following: boolean } | undefined {
  const db = readDB();
  const follower = db.users.find((u) => u.id === followerId);
  const target = db.users.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (!follower || !target || follower.id === target.id) return undefined;

  const already = follower.followingIds.includes(target.id);
  if (already) {
    follower.followingIds = follower.followingIds.filter((id) => id !== target.id);
    target.followerIds = target.followerIds.filter((id) => id !== follower.id);
  } else {
    follower.followingIds.push(target.id);
    target.followerIds.push(follower.id);
    addNotification(db, { userId: target.id, actorId: follower.id, type: "follow" });
  }
  writeDB(db);
  return { following: !already };
}

/* ---------------------------- Pins ---------------------------- */

export function getPins(): DBPin[] {
  return readDB().pins.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export function findPinById(id: string): DBPin | undefined {
  return readDB().pins.find((p) => p.id === id);
}
export function getPinsByAuthor(authorId: string): DBPin[] {
  return getPins().filter((p) => p.authorId === authorId);
}

export function createPin(input: {
  title: string;
  description: string;
  imageUrl: string;
  aspectRatio: number;
  tags: string[];
  authorId: string;
  mediaType?: "image" | "video";
  albumId?: string;
}): DBPin {
  const db = readDB();
  const pin: DBPin = {
    id: uuid(),
    title: input.title,
    description: input.description,
    mediaType: input.mediaType ?? "image",
    imageUrl: input.imageUrl,
    aspectRatio: input.aspectRatio,
    authorId: input.authorId,
    tags: input.tags,
    likedBy: [],
    savedBy: [],
    comments: [],
    albumId: input.albumId,
    createdAt: new Date().toISOString(),
  };
  db.pins.unshift(pin);
  writeDB(db);
  return pin;
}

/** Creates several pins at once, all sharing a new albumId. */
export function createAlbumPins(input: {
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  items: { imageUrl: string; aspectRatio: number; mediaType?: "image" | "video" }[];
}): DBPin[] {
  const db = readDB();
  const albumId = uuid();
  const created: DBPin[] = input.items.map((item) => ({
    id: uuid(),
    title: input.title,
    description: input.description,
    mediaType: item.mediaType ?? "image",
    imageUrl: item.imageUrl,
    aspectRatio: item.aspectRatio,
    authorId: input.authorId,
    tags: input.tags,
    likedBy: [],
    savedBy: [],
    comments: [],
    albumId,
    createdAt: new Date().toISOString(),
  }));
  db.pins.unshift(...created);
  writeDB(db);
  return created;
}

export function getPinsByAlbum(albumId: string, excludeId?: string): DBPin[] {
  return getPins().filter((p) => p.albumId === albumId && p.id !== excludeId);
}

export function deletePin(id: string) {
  const db = readDB();
  db.pins = db.pins.filter((p) => p.id !== id);
  db.boards.forEach((b) => (b.pinIds = b.pinIds.filter((pid) => pid !== id)));
  db.reports.forEach((r) => {
    if (r.pinId === id) r.status = "resolved";
  });
  writeDB(db);
}

/** Admin-initiated delete that leaves the pin's author a moderation note. */
export function adminDeletePin(id: string, adminId: string, note?: string): DBPin | undefined {
  const db = readDB();
  const pin = db.pins.find((p) => p.id === id);
  if (!pin) return undefined;
  if (note?.trim()) {
    addNotification(db, {
      userId: pin.authorId,
      actorId: adminId,
      type: "removed",
      message: note.trim(),
    });
  }
  db.pins = db.pins.filter((p) => p.id !== id);
  db.boards.forEach((b) => (b.pinIds = b.pinIds.filter((pid) => pid !== id)));
  db.reports.forEach((r) => {
    if (r.pinId === id) r.status = "resolved";
  });
  writeDB(db);
  return pin;
}

export function toggleLike(pinId: string, userId: string): { liked: boolean } | undefined {
  const db = readDB();
  const pin = db.pins.find((p) => p.id === pinId);
  if (!pin) return undefined;
  const liked = pin.likedBy.includes(userId);
  if (liked) {
    pin.likedBy = pin.likedBy.filter((id) => id !== userId);
  } else {
    pin.likedBy.push(userId);
    if (pin.authorId !== userId) addNotification(db, { userId: pin.authorId, actorId: userId, type: "like", pinId });
  }
  writeDB(db);
  return { liked: !liked };
}

export function toggleSave(pinId: string, userId: string): { saved: boolean } | undefined {
  const db = readDB();
  const pin = db.pins.find((p) => p.id === pinId);
  if (!pin) return undefined;
  const saved = pin.savedBy.includes(userId);
  if (saved) {
    pin.savedBy = pin.savedBy.filter((id) => id !== userId);
  } else {
    pin.savedBy.push(userId);
    if (pin.authorId !== userId) addNotification(db, { userId: pin.authorId, actorId: userId, type: "save", pinId });
  }
  writeDB(db);
  return { saved: !saved };
}

export function addComment(pinId: string, authorId: string, text: string): DBComment | undefined {
  const db = readDB();
  const pin = db.pins.find((p) => p.id === pinId);
  if (!pin) return undefined;
  const comment: DBComment = { id: uuid(), authorId, text, createdAt: new Date().toISOString() };
  pin.comments.push(comment);
  if (pin.authorId !== authorId) addNotification(db, { userId: pin.authorId, actorId: authorId, type: "comment", pinId });
  writeDB(db);
  return comment;
}

/* ------------------------- Notifications ------------------------- */

function addNotification(db: DBShape, input: { userId: string; actorId: string; type: NotificationType; pinId?: string; message?: string }) {
  const notification: DBNotification = {
    id: uuid(),
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  db.notifications.unshift(notification);
}

export function getNotificationsForUser(userId: string): DBNotification[] {
  return readDB().notifications.filter((n) => n.userId === userId).slice(0, 50);
}

export function markAllNotificationsRead(userId: string) {
  const db = readDB();
  db.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  writeDB(db);
}

/* ---------------------------- Reports ---------------------------- */

export function createReport(pinId: string, reporterId: string, reason: ReportReasonId): DBReport {
  const db = readDB();
  const report: DBReport = {
    id: uuid(),
    pinId,
    reporterId,
    reason,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.reports.unshift(report);
  writeDB(db);
  return report;
}

export function getOpenReports(): DBReport[] {
  return readDB().reports.filter((r) => r.status === "open");
}

export function resolveReport(id: string) {
  const db = readDB();
  const report = db.reports.find((r) => r.id === id);
  if (!report) return;
  report.status = "resolved";
  writeDB(db);
}

/* ---------------------------- Boards ---------------------------- */

export function getBoardsByOwner(ownerId: string): DBBoard[] {
  return readDB().boards.filter((b) => b.ownerId === ownerId);
}

/* ------------------------ Public projections ------------------------ */

const unknownAuthor = { id: "", name: "Deleted user", username: "deleted", avatarUrl: "" };

function commentToPublic(comment: DBComment): PublicComment {
  const author = findUserById(comment.authorId);
  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    author: author ? toPublicUser(author) : unknownAuthor,
  };
}

/** Converts a stored pin into the shape the frontend renders, relative to an optional viewer. */
export function pinToPublic(pin: DBPin, viewerId?: string | null): PublicPin {
  const author = findUserById(pin.authorId);
  return {
    id: pin.id,
    title: pin.title,
    description: pin.description,
    mediaType: pin.mediaType,
    imageUrl: pin.imageUrl,
    aspectRatio: pin.aspectRatio,
    author: author ? toPublicUser(author) : unknownAuthor,
    tags: pin.tags,
    likeCount: pin.likedBy.length,
    saveCount: pin.savedBy.length,
    commentCount: pin.comments.length,
    comments: pin.comments.map(commentToPublic),
    albumId: pin.albumId,
    likedByMe: viewerId ? pin.likedBy.includes(viewerId) : false,
    savedByMe: viewerId ? pin.savedBy.includes(viewerId) : false,
    createdAt: pin.createdAt,
  };
}

export function getRelatedPins(pin: DBPin, count = 8): DBPin[] {
  return getPins()
    .filter((p) => p.id !== pin.id && p.tags.some((t) => pin.tags.includes(t)))
    .slice(0, count);
}
