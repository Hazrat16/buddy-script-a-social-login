import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import { authRouter } from "./routes/auth";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";

const app = express();
const PORT = Number(process.env.API_PORT) || 3001;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
