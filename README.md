# Social app (monorepo)

Next.js frontend (`apps/web`) and Express + Prisma API (`apps/api`). Run **both** with one command from the repository root.

## Quick start

PostgreSQL is required. Easiest local option:

```bash
cd /path/to/social-app
docker compose up -d
npm install
npm run db:push
npm run dev
```

`DATABASE_URL` in `apps/api/.env` must point at your Postgres instance (see `apps/api/.env.example`; defaults match `docker-compose.yml`).

- **Web**: [http://localhost:3000](http://localhost:3000)  
- **API**: [http://127.0.0.1:3001](http://127.0.0.1:3001) (used internally; the browser talks to `/api` and `/uploads` on port 3000 via Next.js rewrites)

## Environment

The **database URL is only in the API** (`apps/api/.env`), not in the web app.

| File | Purpose |
|------|---------|
| **`apps/api/.env`** | **`DATABASE_URL`** (Prisma), `AUTH_SECRET`, `API_PORT`, `WEB_ORIGIN` |
| **`apps/web/.env`** | `AUTH_SECRET` (must match API), `API_INTERNAL_URL` (default `http://127.0.0.1:3001`) |

**Example:** `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_app?schema=public"` (see `docker-compose.yml`).

Templates: `apps/api/.env.example`, `apps/web/.env.example`, root `.env.example`.

## Scripts (root)

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm run dev` | Starts API + Next dev servers together           |
| `npm run build` | Builds API (`tsc`) then Next (`next build`)  |
| `npm run start` | Runs production API + Next (after build)     |
| `npm run db:push` | Applies Prisma schema to Postgres (`apps/api`) |
| `docker compose up -d` | Starts local Postgres (`docker-compose.yml`) |

## Layout

```
apps/
  api/          Express, Prisma, JWT cookies, uploads/
  web/          Next.js UI only (proxies /api and /uploads to API)
```

More detail: `apps/web/README.md`.
