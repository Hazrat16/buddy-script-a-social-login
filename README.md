# Social app (monorepo)

Next.js frontend (`apps/web`) and Express + Prisma API (`apps/api`). Run **both** with one command from the repository root.

## Quick start

PostgreSQL is required. Easiest local option:

```bash
cd /path/to/social-app
npm run docker:up
npm install
npm run db:push
npm run dev
```

`DATABASE_URL` in `apps/api/.env` must point at your Postgres instance (see `apps/api/.env.example`). Compose maps the DB to **localhost:5433** so it does not clash with an existing Postgres on **5432**.

If you already run Postgres on 5432 and want to use that instead of Docker, set `DATABASE_URL` to that server and skip `docker compose`.

- **Web**: [http://localhost:3000](http://localhost:3000)  
- **API**: [http://127.0.0.1:3001](http://127.0.0.1:3001) (used internally; the browser talks to `/api` and `/uploads` on port 3000 via Next.js rewrites)

## Environment

The **database URL is only in the API** (`apps/api/.env`), not in the web app.

| File | Purpose |
|------|---------|
| **`apps/api/.env`** | **`DATABASE_URL`** (Prisma), `AUTH_SECRET`, `API_PORT`, `WEB_ORIGIN` |
| **`apps/web/.env`** | `AUTH_SECRET` (must match API), **`BACKEND_API_URL`** or **`NEXT_API_BASE_URL`** (Express / Railway origin only — **not** your Vercel site URL; legacy `API_INTERNAL_URL` still works) |

**Production web → API:** set **`BACKEND_API_URL`** (preferred) or **`NEXT_API_BASE_URL`** on the Next.js service to your **Express** base URL (e.g. Railway), **not** the Vercel frontend URL. The app proxies `/api/*` server-side and rewrites `/uploads/*` to that host. Set this **before `next build`** on Vercel (enable for **Build** + **Production**). Ensure **`WEB_ORIGIN`** on the API matches the browser origin of your Next app (CORS). The **browser** still calls **`https://<your-next-host>/api/...`** so session cookies stay on the Next origin; see `apps/web/README.md` (“Vercel + Railway”).

**Example (Docker Compose in this repo):** `postgresql://postgres:postgres@localhost:5433/social_app?schema=public`

**Example (Postgres already on your machine, default port):** `postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public`

**Production (Neon):** set `DATABASE_URL` on the **API** service to your Neon connection string (pooled host recommended). Include `sslmode=require`; Neon may also suggest `channel_binding=require`. Run `npm run db:push -w api` once against that database so tables exist. Do not commit credentials—use your host’s secret / environment UI only.

Templates: `apps/api/.env.example`, `apps/web/.env.example`, root `.env.example`.

## Scripts (root)

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm run dev` | Starts API, waits for port **3001**, then starts Next (avoids proxy errors) |
| `npm run build` | Builds API (`tsc`) then Next (`next build`)  |
| `npm run start` | Runs production API + Next (after build)     |
| `npm run db:push` | Applies Prisma schema to Postgres (`apps/api`) |
| `npm run docker:up` | Starts Postgres in Docker (port **5433** on host) |
| `npm run docker:down` | Stops Postgres container |

## Layout

```
apps/
  api/          Express, Prisma, JWT cookies, uploads/
  web/          Next.js UI only (proxies /api and `/uploads` to API)
```

## Troubleshooting

`npm run dev` starts the **API first**, runs a small **Node wait script** until port **3001** accepts connections, then starts Next — so `/api` rewrites do not hit a dead server.

If login or register returns **503** with a message about **database tables**, Postgres is reachable but the schema was never applied — run **`npm run db:push`** from the repo root (after `docker:up` if you use Docker).

If you still see **ECONNREFUSED** on `3001`, the API process exited (check the `[api]` lines): common causes are missing **`apps/api/.env`**, invalid **`DATABASE_URL`** (Postgres not running / wrong port), or **`AUTH_SECRET`** shorter than 32 characters. Run `npm run dev -w api` alone to see the stack trace.

### Source maps (404)

Bootstrap `.map` files are not shipped under `public/assets`; those 404s are harmless unless you need browser debugging of minified vendor JS.

More detail: `apps/web/README.md`.
