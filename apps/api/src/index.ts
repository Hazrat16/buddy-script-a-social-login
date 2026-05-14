import "dotenv/config";
import express from "express";
import { Prisma } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { prisma } from "./lib/prisma";
import { requireAuth } from "./middleware/requireAuth";
import { authRouter } from "./routes/auth";
import { commentsRouter } from "./routes/comments";
import { getMyPostsHandler, postsRouter } from "./routes/posts";
import { usersRouter } from "./routes/users";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.API_PORT) || 3001;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

/** Browsers hitting the bare Railway host see this instead of "Cannot GET /". */
app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "buddy-api",
    message: "Use /health or /api/health. REST lives under /api/*.",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "buddy-api" });
});

app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

/** Same payload as `/health`, plus DB connectivity (for monitoring via `/api/*` or Vercel proxy). */
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, service: "buddy-api", db: "connected" });
  } catch {
    res.status(503).json({ ok: false, service: "buddy-api", db: "disconnected" });
  }
});

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

/** Full paths on the app so these are never missed by a sub-router or an old `dist` layout. */
app.get("/api/posts/me", requireAuth, getMyPostsHandler);
app.get("/api/auth/me/posts", requireAuth, getMyPostsHandler);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
    const prod = process.env.NODE_ENV === "production";
    res.status(503).json({
      error: "Database tables are missing (Prisma: referenced table does not exist).",
      hint: prod
        ? "On your API host (e.g. Railway): ensure DATABASE_URL points at Postgres, then apply the schema once — from your machine: `cd apps/api && DATABASE_URL='…' npx prisma db push`, or add a Railway deploy/release step that runs `npx prisma db push` before `node dist/index.js`."
        : "From the repo root: npm run docker:up (if you use Compose), then npm run db:push",
    });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
