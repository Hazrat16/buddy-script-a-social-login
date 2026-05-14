# API (Express)

Prisma + **PostgreSQL**. JWT session cookie `buddy_session` (same name as the Next app’s `getSession()` / `(app)` layout expects).

Local DB: from repo root run `npm run docker:up` (Postgres on **localhost:5433**), then ensure `DATABASE_URL` in `apps/api/.env` uses that port (see `.env.example`). If you use your own Postgres on port 5432, point `DATABASE_URL` there and skip Docker.

## Scripts

- `npm run dev` — `tsx watch` for hot reload  
- `npm run build` — `prisma generate` + `tsc`  
- `npm run start` — `node dist/index.js`  
- `npm run db:push` / `db:studio` — Prisma

Uploads are stored under `apps/api/uploads` and served at `/uploads`.

## Health

| Method | Path | CORS | Body |
|--------|------|------|------|
| `GET` | `/health` | Before CORS middleware | `{ "ok": true, "service": "buddy-api" }` — use for Railway/uptime probes (no `/api` prefix). |
| `GET` | `/api/health` | Yes | `200` `{ "ok": true, "service": "buddy-api", "db": "connected" }` or `503` if Postgres is unreachable — same path style as other REST routes; works through the Next.js `/api` proxy as `/api/health`. |
