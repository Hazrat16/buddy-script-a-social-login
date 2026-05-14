# Web (Next.js)

Frontend only. All REST endpoints live in **`apps/api`** (Express). The browser calls **`/api/*` on the same host as the Next app** (e.g. `https://…vercel.app/api/...`). Next.js **serverless routes** forward those requests to Express using **`BACKEND_API_URL`** (recommended) or **`NEXT_API_BASE_URL`** / legacy **`API_INTERNAL_URL`**. **`/uploads/*`** is rewritten in `next.config` to the same API base.

## Local

From repo root: `npm run dev`  
Or from this folder: `npm run dev` (ensure API is already running on port 3001, or set `BACKEND_API_URL` / `NEXT_API_BASE_URL`).

### Local Next UI + production API (Railway)

Put **`BACKEND_API_URL=https://…railway.app`** (or `NEXT_API_BASE_URL=…`) in `apps/web/.env` and restart `next dev`. The **browser will still call** `http://localhost:3000/api/...` — that is your Next server. Next then **proxies** those requests to Railway. Check the terminal on startup for `[buddy web] /api/* is proxied to: …`, or DevTools → Network → any `/api/*` response → **`x-upstream-base`** / **`x-upstream-host`**.

**`AUTH_SECRET`** in `apps/web/.env` must match the value on the **production API** (Railway), or the app cannot verify the session JWT and protected routes will bounce you to `/login`.

Opening **`https://…railway.app/`** in a tab only checks that the API host answers; it does not control where the app sends `/api` traffic. After deploy, the API root returns JSON (not an HTML “landing page”).

## Build

From root: `npm run build`  
Or: `npm run build` here (API should be built first if you rely on a full stack build from root).

## Production API URL

Set **`BACKEND_API_URL`** or **`NEXT_API_BASE_URL`** to your deployed Express base (example: `https://buddy-script-a-social-platform-production.up.railway.app`). **Do not** set it to your Vercel site URL — that is the frontend, not the API. Vercel / CI must provide this **at build time** as well as runtime so `next.config` rewrites and optional image hosts resolve correctly.

On **`apps/api`**, set **`WEB_ORIGIN`** to the exact origin users use in the browser (your Next app URL) so CORS works for any server-side or tooling that calls the API directly.

## Vercel + Railway: the browser still shows `vercel.app/api/...`

That is **intentional**. Your **httpOnly** session cookie must be issued in a response to **`https://<your-project>.vercel.app`** so it is stored for that origin. The **`app/(app)/layout.tsx`** server layout then reads that cookie (same secret as the API) before `/feed` and other app routes render. If the browser called **`https://…railway.app/api/auth/login`** directly, the cookie would belong to Railway’s host and **would not be sent** when you open `/feed` on Vercel — you would stay logged out.

So: **Network tab → URL = Vercel** for `/api/*`, while the **Vercel server** forwards the request to **`BACKEND_API_URL` / `NEXT_API_BASE_URL`** (Railway). Set that variable on Vercel (including for **Build**) and redeploy; do **not** try to point the browser at Railway for auth unless you redesign auth (e.g. tokens + no httpOnly cookie on Vercel).

To **confirm** the proxy target, open DevTools → **Network** → pick any `/api/...` response → **Response headers** should include `x-upstream-host: …railway.app` and `x-proxied-by: nextjs` when the upstream fetch succeeded.

See the [root README](../../README.md) for the monorepo overview.
