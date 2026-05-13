# API (Express)

Prisma + **PostgreSQL**. JWT session cookie `buddy_session` (same name as the Next middleware expects).

Local DB: from repo root run `npm run docker:up` (Postgres on **localhost:5433**), then ensure `DATABASE_URL` in `apps/api/.env` uses that port (see `.env.example`). If you use your own Postgres on port 5432, point `DATABASE_URL` there and skip Docker.

## Scripts

- `npm run dev` — `tsx watch` for hot reload  
- `npm run build` — `prisma generate` + `tsc`  
- `npm run start` — `node dist/index.js`  
- `npm run db:push` / `db:studio` — Prisma

Uploads are stored under `apps/api/uploads` and served at `/uploads`.
