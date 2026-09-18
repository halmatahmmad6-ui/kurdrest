export type MediaType = "image" | "video";

export interface PublicAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

export interface PublicComment {
  id: string;
  text: string;
  createdAt: string;
  author: PublicAuthor;
}

export interface PublicPin {
  id: string;
  title: string;
  description: string;
  mediaType: MediaType;
  imageUrl: string;
  /** natural aspect ratio (height / width) — drives masonry card height */
  aspectRatio: number;
  author: PublicAuthor;
  tags: string[];
  likeCount: number;
  saveCount: number;
  commentCount: number;
  comments: PublicComment[];
  albumId?: string;
  /** whether the current viewer has liked/saved this pin (false if logged out) */
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
}

export interface PublicBoard {
  id: string;
  name: string;
  coverImageUrl: string;
  pinCount: number;
  isPrivate: boolean;
}

/** Alias kept so existing component imports of `Pin` keep working. */
export type Pin = PublicPin;

