import "dotenv/config";
import express from "express";
import { Prisma } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { authRouter } from "./routes/auth";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";

const app = express();
const PORT = Number(process.env.API_PORT) || 3001;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
    res.status(503).json({
      error:
        "Database tables are missing. From the repo root: npm run docker:up (if you use Compose), then npm run db:push",
    });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
