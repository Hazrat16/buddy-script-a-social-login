# API (Express)

Prisma + **PostgreSQL**. JWT session cookie `buddy_session` (same name as the Next app’s `getSession()` / `(app)` layout expects).

Local DB: from repo root run `npm run docker:up` (Postgres on **localhost:5433**), then ensure `DATABASE_URL` in `apps/api/.env` uses that port (see `.env.example`). If you use your own Postgres on port 5432, point `DATABASE_URL` there and skip Docker.

## Scripts

- `npm run dev` — `tsx watch` for hot reload  
- `npm run build` — `prisma generate` + `tsc`  
- `npm run start` — `node dist/index.js`  
- `npm run db:push` / `db:studio` — Prisma

Uploads are stored under `apps/api/uploads` and served at `/uploads`.

In production (e.g. Next on Vercel + API on Railway), browsers should load images from the **public API host**, not only through Next rewrites. Set **`API_PUBLIC_URL`** on the API (same value as your public `https://…` API base, no path) so JSON post payloads use absolute `imageUrl` values like `https://…railway.app/uploads/…`. Optionally set **`NEXT_PUBLIC_UPLOADS_ORIGIN`** on the Next app to the same origin as a client-side fallback when responses still contain relative `/uploads/…` paths.

### Cloud images (recommended for production)

Sign up at [Cloudinary](https://cloudinary.com/) (free tier). In the API environment set **`CLOUDINARY_URL`** (from the Cloudinary console) or **`CLOUDINARY_CLOUD_NAME`**, **`CLOUDINARY_API_KEY`**, and **`CLOUDINARY_API_SECRET`**. New post images are uploaded there and **`Post.imageUrl`** stores the **`https://res.cloudinary.com/...`** URL (no disk on Railway, works everywhere). Optional **`CLOUDINARY_FOLDER`** defaults to `buddy_posts`. If Cloudinary is not configured, the API keeps using local **`./uploads`** (fine for development).

## Health

| Method | Path | CORS | Body |
|--------|------|------|------|
| `GET` | `/health` | Before CORS middleware | `{ "ok": true, "service": "buddy-api" }` — use for Railway/uptime probes (no `/api` prefix). |
| `GET` | `/api/health` | Yes | `200` `{ "ok": true, "service": "buddy-api", "db": "connected" }` or `503` if Postgres is unreachable — same path style as other REST routes; works through the Next.js `/api` proxy as `/api/health`. |
