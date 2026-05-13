import { Router } from "express";
import { z } from "zod";
import { Visibility } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const PAGE = 15;
const LIKER_PREVIEW = 40;
const COMMENT_LIKER_PREVIEW = 30;
const MAX_COMMENTS = 400;

const createSchema = z.object({
  body: z.string().trim().min(1).max(8000),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  parentId: z.string().cuid().optional().nullable(),
});

const jsonPatchSchema = createSchema.extend({
  removeImage: z.boolean().optional(),
});

async function unlinkUploadsFile(imageUrl: string | null) {
  if (!imageUrl?.startsWith("/uploads/")) return;
  const base = path.basename(imageUrl);
  if (!base || base.includes("..") || base.includes("/")) return;
  const fp = path.join(process.cwd(), "uploads", base);
  try {
    await fs.unlink(fp);
  } catch {
    /* file missing */
  }
}

function decodeCursor(cursor: string | null | undefined): { createdAt: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      c: string;
      i: string;
    };
    const d = new Date(raw.c);
    if (Number.isNaN(d.getTime()) || !raw.i) return null;
    return { createdAt: d, id: raw.i };
  } catch {
    return null;
  }
}

function encodeCursor(createdAt: Date, id: string) {
  return Buffer.from(JSON.stringify({ c: createdAt.toISOString(), i: id }), "utf8").toString(
    "base64url",
  );
}

async function assertPostVisible(postId: string, userId: string) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      OR: [{ visibility: Visibility.PUBLIC }, { authorId: userId }],
    },
    select: { id: true },
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const postsRouter = Router();

postsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  const session = req.auth!;
  const cur = decodeCursor(typeof req.query.cursor === "string" ? req.query.cursor : undefined);

  const posts = await prisma.post.findMany({
    where: {
      AND: [
        {
          OR: [{ visibility: Visibility.PUBLIC }, { authorId: session.sub }],
        },
        ...(cur
          ? [
              {
                OR: [
                  { createdAt: { lt: cur.createdAt } },
                  { AND: [{ createdAt: cur.createdAt }, { id: { lt: cur.id } }] },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE + 1,
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true, comments: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: LIKER_PREVIEW,
        select: {
          userId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  const slice = posts.length > PAGE ? posts.slice(0, PAGE) : posts;
  const postIds = slice.map((p) => p.id);
  const myLikes = await prisma.postLike.findMany({
    where: { userId: session.sub, postId: { in: postIds } },
    select: { postId: true },
  });
  const myLikeSet = new Set(myLikes.map((l) => l.postId));

  let nextCursor: string | null = null;
  if (posts.length > PAGE) {
    const last = slice[PAGE - 1]!;
    nextCursor = encodeCursor(last.createdAt, last.id);
  }

  const data = slice.map((p) => ({
    id: p.id,
    body: p.body,
    imageUrl: p.imageUrl,
    visibility: p.visibility,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    author: p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: myLikeSet.has(p.id),
    likedBy: p.likes.map((l) => ({
      id: l.user.id,
      firstName: l.user.firstName,
      lastName: l.user.lastName,
    })),
  }));

  res.json({ posts: data, nextCursor });
}));

postsRouter.post("/", requireAuth, (req, res, next) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    upload.single("image")(req, res, next);
  } else {
    next();
  }
}, asyncHandler(async (req, res) => {
  const session = req.auth!;
  let body: string;
  let visibility: Visibility;
  let imageUrl: string | null = null;

  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    const b = req.body?.body;
    const v = req.body?.visibility;
    const parsed = createSchema.safeParse({
      body: typeof b === "string" ? b : "",
      visibility: typeof v === "string" ? v : "",
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid post" });
      return;
    }
    body = parsed.data.body;
    visibility = parsed.data.visibility as Visibility;

    const file = req.file;
    if (file && file.size > 0) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.mimetype)) {
        res.status(400).json({ error: "Unsupported image type" });
        return;
      }
      const ext =
        file.mimetype === "image/png"
          ? "png"
          : file.mimetype === "image/webp"
            ? "webp"
            : file.mimetype === "image/gif"
              ? "gif"
              : "jpg";
      const name = `${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, name), file.buffer);
      imageUrl = `/uploads/${name}`;
    }
  } else {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid post" });
      return;
    }
    body = parsed.data.body;
    visibility = parsed.data.visibility as Visibility;
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.sub,
      body,
      visibility,
      imageUrl,
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true, comments: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: LIKER_PREVIEW,
        select: {
          userId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  res.json({
    post: {
      id: post.id,
      body: post.body,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByMe: false,
      likedBy: post.likes.map((l) => ({
        id: l.user.id,
        firstName: l.user.firstName,
        lastName: l.user.lastName,
      })),
    },
  });
}));

postsRouter.patch(
  "/:postId",
  requireAuth,
  (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      upload.single("image")(req, res, next);
    } else {
      next();
    }
  },
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const session = req.auth!;

    const owned = await prisma.post.findFirst({
      where: { id: postId, authorId: session.sub },
      select: { id: true, imageUrl: true },
    });
    if (!owned) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const ct = req.headers["content-type"] || "";
    let bodyText: string;
    let visibility: Visibility;
    let removeImage = false;
    let newImageUrl: string | null = null;

    if (ct.includes("multipart/form-data")) {
      const b = req.body?.body;
      const v = req.body?.visibility;
      const ri = req.body?.removeImage;
      const parsed = createSchema.safeParse({
        body: typeof b === "string" ? b : "",
        visibility: typeof v === "string" ? v : "",
      });
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid post" });
        return;
      }
      bodyText = parsed.data.body;
      visibility = parsed.data.visibility as Visibility;
      removeImage = ri === "true" || ri === true || ri === "1";

      const file = req.file;
      if (file && file.size > 0) {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.mimetype)) {
          res.status(400).json({ error: "Unsupported image type" });
          return;
        }
        const ext =
          file.mimetype === "image/png"
            ? "png"
            : file.mimetype === "image/webp"
              ? "webp"
              : file.mimetype === "image/gif"
                ? "gif"
                : "jpg";
        const name = `${crypto.randomUUID()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, name), file.buffer);
        newImageUrl = `/uploads/${name}`;
      }
    } else {
      const parsed = jsonPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid post" });
        return;
      }
      bodyText = parsed.data.body;
      visibility = parsed.data.visibility as Visibility;
      removeImage = parsed.data.removeImage === true;
    }

    if (removeImage) {
      await unlinkUploadsFile(owned.imageUrl);
    } else if (newImageUrl) {
      await unlinkUploadsFile(owned.imageUrl);
    }

    let imageUrlUpdate: string | null | undefined;
    if (removeImage) {
      imageUrlUpdate = null;
    } else if (newImageUrl) {
      imageUrlUpdate = newImageUrl;
    } else {
      imageUrlUpdate = undefined;
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        body: bodyText,
        visibility,
        ...(imageUrlUpdate !== undefined ? { imageUrl: imageUrlUpdate } : {}),
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { likes: true, comments: true } },
        likes: {
          orderBy: { createdAt: "desc" },
          take: LIKER_PREVIEW,
          select: {
            userId: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const myLike = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: session.sub } },
    });

    res.json({
      post: {
        id: post!.id,
        body: post!.body,
        imageUrl: post!.imageUrl,
        visibility: post!.visibility,
        createdAt: post!.createdAt.toISOString(),
        updatedAt: post!.updatedAt.toISOString(),
        author: post!.author,
        likeCount: post!._count.likes,
        commentCount: post!._count.comments,
        likedByMe: !!myLike,
        likedBy: post!.likes.map((l) => ({
          id: l.user.id,
          firstName: l.user.firstName,
          lastName: l.user.lastName,
        })),
      },
    });
  }),
);

postsRouter.post("/:postId/like", requireAuth, asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const session = req.auth!;

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      OR: [{ visibility: Visibility.PUBLIC }, { authorId: session.sub }],
    },
    select: { id: true },
  });
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: session.sub } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId: session.sub } });
  }

  const updated = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      _count: { select: { likes: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: LIKER_PREVIEW,
        select: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  res.json({
    likedByMe: !existing,
    likeCount: updated!._count.likes,
    likedBy: updated!.likes.map((l) => ({
      id: l.user.id,
      firstName: l.user.firstName,
      lastName: l.user.lastName,
    })),
  });
}));

postsRouter.get("/:postId/comments", requireAuth, asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const session = req.auth!;

  const post = await assertPostVisible(postId, session.sub);
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const rows = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    take: MAX_COMMENTS,
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: COMMENT_LIKER_PREVIEW,
        select: { userId: true, user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  type CommentJson = {
    id: string;
    parentId: string | null;
    body: string;
    createdAt: string;
    author: { id: string; firstName: string; lastName: string };
    likeCount: number;
    likedByMe: boolean;
    likedBy: { id: string; firstName: string; lastName: string }[];
    replies: CommentJson[];
  };

  const commentIds = rows.map((r) => r.id);
  const myLikes = await prisma.commentLike.findMany({
    where: { userId: session.sub, commentId: { in: commentIds } },
    select: { commentId: true },
  });
  const myLikeSet = new Set(myLikes.map((l) => l.commentId));

  const mapped = new Map<string, CommentJson>();
  for (const c of rows) {
    mapped.set(c.id, {
      id: c.id,
      parentId: c.parentId,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: c.user,
      likeCount: c._count.likes,
      likedByMe: myLikeSet.has(c.id),
      likedBy: c.likes.map((l) => ({
        id: l.user.id,
        firstName: l.user.firstName,
        lastName: l.user.lastName,
      })),
      replies: [],
    });
  }

  const roots: CommentJson[] = [];
  for (const c of rows) {
    const node = mapped.get(c.id)!;
    if (c.parentId && mapped.has(c.parentId)) {
      mapped.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.json({ comments: roots });
}));

postsRouter.post("/:postId/comments", requireAuth, asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const session = req.auth!;

  const post = await assertPostVisible(postId, session.sub);
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid comment" });
    return;
  }

  const { body, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId },
      select: { id: true },
    });
    if (!parent) {
      res.status(400).json({ error: "Parent comment not found" });
      return;
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.sub,
      body,
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { userId: true, user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  const myLike = await prisma.commentLike.findFirst({
    where: { commentId: comment.id, userId: session.sub },
  });

  res.json({
    comment: {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: comment.user,
      likeCount: comment._count.likes,
      likedByMe: !!myLike,
      likedBy: comment.likes.map((l) => ({
        id: l.user.id,
        firstName: l.user.firstName,
        lastName: l.user.lastName,
      })),
      replies: [],
    },
  });
}));
