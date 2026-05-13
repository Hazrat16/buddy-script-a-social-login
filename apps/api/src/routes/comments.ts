import { Router } from "express";
import { Visibility } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const LIKER_PREVIEW = 30;

export const commentsRouter = Router();
commentsRouter.post("/:commentId/like", requireAuth, async (req, res) => {
  const { commentId } = req.params;
  const session = req.auth!;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true },
  });
  if (!comment) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId: session.sub } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentLike.create({ data: { commentId, userId: session.sub } });
  }

  const updated = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      _count: { select: { likes: true } },
      likes: {
        orderBy: { createdAt: "desc" },
        take: LIKER_PREVIEW,
        select: { user: { select: { id: true, firstName: true, lastName: true } } },
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
});
