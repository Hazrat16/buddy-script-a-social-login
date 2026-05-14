# Social app

Monorepo with a **Next.js** app (`apps/web`) and an **Express + Prisma** API (`apps/api`). One command runs both locally.

---

## Prerequisites

- **Node.js** 20+ and **npm**
- **PostgreSQL** — easiest path is **Docker** (see below). You can use an existing Postgres on your machine instead.

---

## Run locally (step by step)

### 1. Clone and install dependencies

```bash
git clone <repository-url> social-app
cd social-app
npm install
```

### 2. Environment files

Create two env files from the examples (or copy and edit):

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

The root **`.env.example`** only references those two paths; you still copy each file into `apps/api/.env` and `apps/web/.env` as above.

**`apps/api/.env`**

| Variable | Local value |
|----------|-------------|
| `DATABASE_URL` | Use the URL below if you use Docker Postgres on **5433** |
| `AUTH_SECRET` | Any random string **≥ 32 characters** (JWT signing) |
| `WEB_ORIGIN` | `http://localhost:3000` |
| `API_PORT` | `3001` (default) |
| `API_PUBLIC_URL` | `http://127.0.0.1:3001` — optional; helps absolute image URLs for `/uploads` |

With **Docker Compose** from this repo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/social_app?schema=public"
```

**`apps/web/.env`**

| Variable | Rule |
|----------|------|
| `AUTH_SECRET` | **Must match** `AUTH_SECRET` in `apps/api/.env` |
| `NEXT_API_BASE_URL` or `BACKEND_API_URL` | `http://127.0.0.1:3001` — the Express API base URL (not the Next URL) |
| `NEXT_PUBLIC_UPLOADS_ORIGIN` | Same as API base for local images: `http://127.0.0.1:3001` (optional but useful) |

### 3. Start Postgres (Docker)

From the **repository root**:

```bash
npm run docker:up
```

This starts PostgreSQL with host port **5433** (so it does not conflict with Postgres already using **5432**).

- Stop later: `npm run docker:down`
- If you use your own Postgres on 5432, set `DATABASE_URL` accordingly and **skip** `docker:up`.

### 4. Create database tables

```bash
npm run db:push
```

Applies the Prisma schema to the database (`apps/api`).

### 5. Start the app

```bash
npm run dev
```

This starts the **API on port 3001**, waits until it responds, then starts **Next.js on port 3000**.

| Service | URL |
|---------|-----|
| Web (Next.js) | [http://localhost:3000](http://localhost:3000) |
| API (Express) | [http://127.0.0.1:3001](http://127.0.0.1:3001) |

In the browser you only use **localhost:3000**. The UI calls `/api/...` and `/uploads/...` on that origin; Next.js **proxies** those to the API.

Open **Register** or **Login**, then use the feed.

---

## Optional: Cloudinary (hosted images)

By default, images are stored under **`apps/api/uploads`** and served from `/uploads`. For production-style hosting, configure **Cloudinary** on the API (see `apps/api/README.md`).

Use the **`CLOUDINARY_URL`** from the Cloudinary dashboard; it must start with **`cloudinary://`**. Alternatively set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## Useful scripts (repository root)

| Command | What it does |
|---------|----------------|
| `npm run dev` | API + Next in development |
| `npm run build` | Production build (API then web) |
| `npm run start` | Run built API + web |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio for the API database |
| `npm run docker:up` / `docker:down` | Start / stop Docker Postgres |

---

## Project layout

```
apps/
  api/     Express REST, Prisma, JWT cookies, file uploads
  web/     Next.js UI; proxies /api and /uploads to the API
```

More detail for the web app and production (Vercel + Railway): **`apps/web/README.md`**. API uploads and Cloudinary: **`apps/api/README.md`**.

---

## Troubleshooting

**503 / database tables missing** — Run `npm run db:push` after Postgres is up.

**ECONNREFUSED on 3001** — API failed to start. Check `apps/api/.env`: `DATABASE_URL`, Postgres running, and `AUTH_SECRET` length (≥ 32). Run `npm run dev -w api` alone to see the error.

**Images 404 locally** — Ensure `NEXT_PUBLIC_UPLOADS_ORIGIN` matches the API (`http://127.0.0.1:3001`) or use Cloudinary.

**Bootstrap `.map` 404 in DevTools** — Vendor source maps are not shipped; safe to ignore for local dev.
