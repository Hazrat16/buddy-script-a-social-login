# API (Express)

Prisma + **PostgreSQL**. JWT session cookie `buddy_session` (same name as the Next middleware expects).

Local DB: from repo root run `docker compose up -d`, then set `DATABASE_URL` in `.env` (see `.env.example`).

## Scripts

- `npm run dev` — `tsx watch` for hot reload  
- `npm run build` — `prisma generate` + `tsc`  
- `npm run start` — `node dist/index.js`  
- `npm run db:push` / `db:studio` — Prisma

Uploads are stored under `apps/api/uploads` and served at `/uploads`.
