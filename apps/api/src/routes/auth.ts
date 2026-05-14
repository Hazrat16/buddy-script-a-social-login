import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, } from "../lib/session";
import { requireAuth } from "../middleware/requireAuth";
import { getMyPostsHandler } from "./posts";
const registerSchema = z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
});
const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(128),
});
export const authRouter = Router();
authRouter.post("/register", asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
        return;
    }
    const { firstName, lastName, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            firstName,
            lastName,
            passwordHash,
        },
    });
    const token = await createSessionToken({ sub: user.id, email: user.email });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
}));
authRouter.post("/login", asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
    }
    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    const token = await createSessionToken({ sub: user.id, email: user.email });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });
}));
authRouter.post("/logout", (_req, res) => {
    res.cookie(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    res.json({ ok: true });
});
authRouter.get("/me/posts", requireAuth, getMyPostsHandler);
authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.auth!.sub },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            _count: { select: { posts: true, comments: true } },
        },
    });
    if (!user) {
        res.status(401).json({ user: null });
        return;
    }
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt.toISOString(),
            postCount: user._count.posts,
            commentCount: user._count.comments,
        },
    });
}));
const profilePatchSchema = z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(255).optional(),
});
authRouter.patch("/profile", requireAuth, asyncHandler(async (req, res) => {
    const parsed = profilePatchSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
        return;
    }
    const session = req.auth!;
    const { firstName, lastName, email: emailRaw } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!existing) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    let nextEmail = existing.email;
    if (emailRaw !== undefined) {
        const lower = emailRaw.toLowerCase();
        if (lower !== existing.email.toLowerCase()) {
            const taken = await prisma.user.findUnique({ where: { email: lower } });
            if (taken) {
                res.status(409).json({ error: "Email already in use" });
                return;
            }
            nextEmail = lower;
        }
    }
    const user = await prisma.user.update({
        where: { id: session.sub },
        data: { firstName, lastName, email: nextEmail },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            _count: { select: { posts: true, comments: true } },
        },
    });
    const token = await createSessionToken({ sub: user.id, email: user.email });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt.toISOString(),
            postCount: user._count.posts,
            commentCount: user._count.comments,
        },
    });
}));
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
});
authRouter.post("/change-password", requireAuth, asyncHandler(async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
        return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!ok) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
    });
    res.json({ ok: true });
}));
