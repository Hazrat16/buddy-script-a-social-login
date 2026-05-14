# Web (Next.js)

Frontend only. All REST endpoints live in **`apps/api`** (Express). The browser calls **`/api/*` on the same host as the Next app** (e.g. `https://…vercel.app/api/...`). Next.js **serverless routes** forward those requests to Express using **`API_INTERNAL_URL`**. **`/uploads/*`** is rewritten in `next.config` to the same API base.

## Local

From repo root: `npm run dev`  
Or from this folder: `npm run dev` (ensure API is already running on port 3001, or set `API_INTERNAL_URL`).

## Build

From root: `npm run build`  
Or: `npm run build` here (API should be built first if you rely on a full stack build from root).

## Production API URL

Set **`API_INTERNAL_URL`** to your deployed Express base (example: `https://buddy-script-a-social-platform-production.up.railway.app`). Railway / CI must provide this **at build time** as well as runtime so `next.config` rewrites and optional image hosts resolve correctly.

On **`apps/api`**, set **`WEB_ORIGIN`** to the exact origin users use in the browser (your Next app URL) so CORS works for any server-side or tooling that calls the API directly.

## Vercel + Railway: the browser still shows `vercel.app/api/...`

That is **intentional**. Your **httpOnly** session cookie must be issued in a response to **`https://<your-project>.vercel.app`** so it is stored for that origin. `middleware.ts` then reads that cookie on `/feed` and `/profile`. If the browser called **`https://…railway.app/api/auth/login`** directly, the cookie would belong to Railway’s host and **would not be sent** when you open `/feed` on Vercel — you would stay logged out.

So: **Network tab → URL = Vercel** for `/api/*`, while the **Vercel server** forwards the request to **`API_INTERNAL_URL`** (Railway). Set `API_INTERNAL_URL` on Vercel (including for **Build**) and redeploy; do **not** try to point the browser at Railway for auth unless you redesign auth (e.g. tokens + no httpOnly cookie on Vercel).

See the [root README](../../README.md) for the monorepo overview.
