import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
export const usersRouter = Router();
const querySchema = z.object({
    search: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(24),
});
usersRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
    const session = req.auth!;
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid query" });
        return;
    }
    const { search, limit } = parsed.data;
    const users = await prisma.user.findMany({
        where: {
            id: { not: session.sub },
            ...(search
                ? {
                    OR: [
                        { firstName: { contains: search, mode: "insensitive" } },
                        { lastName: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            _count: { select: { posts: true } },
        },
    });
    res.json({
        users: users.map((u) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            postCount: u._count.posts,
        })),
    });
}));
