export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
};

export function displayName(u: PublicUser) {
  return `${u.firstName} ${u.lastName}`.trim();
}

export type FeedPost = {
  id: string;
  body: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  author: PublicUser;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  likedBy: PublicUser[];
};

export type CommentNode = {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  author: PublicUser;
  likeCount: number;
  likedByMe: boolean;
  likedBy: PublicUser[];
  replies: CommentNode[];
};
