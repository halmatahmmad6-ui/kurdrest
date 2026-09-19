export type Role = "user" | "admin";

export interface DBUser {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  bio: string;
  role: Role;
  followerIds: string[];
  followingIds: string[];
  createdAt: string;
  /** category tags the user picked in "Refine your recommendations" */
  interests?: string[];
  /** opted in to try experimental features early */
  betaTester?: boolean;
  /** whether the feed may be personalized using the viewer's activity/interests (default true) */
  personalizedAds?: boolean;
}

export interface DBComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface DBPin {
  id: string;
  title: string;
  description: string;
  mediaType: "image" | "video";
  imageUrl: string;
  aspectRatio: number;
  authorId: string;
  tags: string[];
  likedBy: string[];
  savedBy: string[];
  comments: DBComment[];
  /** groups pins uploaded together as one album (optional) */
  albumId?: string;
  createdAt: string;
}

export type NotificationType = "like" | "save" | "comment" | "follow" | "removed" | "ad_approved" | "ad_rejected";

export interface DBNotification {
  id: string;
  userId: string; // recipient
  actorId: string; // who triggered it (the admin, for "removed")
  type: NotificationType;
  pinId?: string;
  /** free-text moderation note, used with type "removed" */
  message?: string;
  read: boolean;
  createdAt: string;
}

export const REPORT_REASONS = [
  { id: "spam", label: "سپام", description: "پۆستی چەواشەکار یان دووبارەبووەوە" },
  { id: "nudity", label: "ڕووتی و ناوەڕۆکی سێکسی", description: "ناوەڕۆکی سێکسی ئاشکرا یان سوءی بەکارهێنانی منداڵان" },
  { id: "self_harm", label: "خۆئازاردان", description: "کێمخۆراکی، بڕین، خۆکوشتن" },
  { id: "misinformation", label: "زانیاری هەڵە", description: "هەڵەی تەندروستی، کەش و هەوا، هەڵبژاردن یان کۆنسپیرەیسی" },
  { id: "hate", label: "چالاکی ڕقبەرانە", description: "پێشداوەری، جۆرپەرستی، وشەی جێڕنجاندن" },
  { id: "dangerous_goods", label: "کاڵای مەترسیدار", description: "دەرمانی نایاسایی، چەک، بەرهەمی سنووردار" },
  { id: "harassment", label: "هەڕەشە یان ڕەخنەی توند", description: "جنێو، هەڕەشە، بولینگی ئۆنلاین" },
  { id: "violence", label: "توندوتیژی ئاشکرا", description: "وێنەی توندوتیژانە یان بانگهێشتن بۆ توندوتیژی" },
  { id: "privacy", label: "پێشێلکردنی تایبەتمەندی", description: "وێنەی تایبەت یان زانیاری کەسی" },
  { id: "intimate_imagery", label: "وێنەی تایبەتی بەبێ ڕەزامەندی", description: "وێنەی تایبەتی کەسێک بەبێ ڕەزامەندی بڵاوکراوەتەوە" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];

export interface DBReport {
  id: string;
  pinId: string;
  reporterId: string;
  reason: ReportReasonId;
  status: "open" | "resolved";
  createdAt: string;
}

/** A sponsored post — shown mixed into the feed, visually like a pin but marked as an ad. */
export interface DBAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  mediaType: "image" | "video";
  aspectRatio: number;
  sponsor: string;
  linkUrl: string;
  tags: string[];
  createdAt: string;
  /** ISO date (YYYY-MM-DD). If set, the ad won't be shown before this date. */
  startDate?: string;
  /** ISO date (YYYY-MM-DD). If set, the ad won't be shown after this date. */
  endDate?: string;
}

/** A pin's owner asking an admin to turn it into a sponsored post. */
export interface DBAdRequest {
  id: string;
  pinId: string;
  requesterId: string;
  sponsor: string;
  linkUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface DBBoard {
  id: string;
  ownerId: string;
  name: string;
  coverImageUrl: string;
  pinIds: string[];
  isPrivate: boolean;
}

export interface DBShape {
  users: DBUser[];
  pins: DBPin[];
  boards: DBBoard[];
  notifications: DBNotification[];
  reports: DBReport[];
  ads: DBAd[];
  adRequests: DBAdRequest[];
}

/** Public-safe view of a user — never send passwordHash to the client. */
export type PublicUser = Omit<DBUser, "passwordHash">;

export function toPublicUser(user: DBUser): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}
