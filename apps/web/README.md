# Web (Next.js)

Frontend only. All REST endpoints live in **`apps/api`** (Express). In development and production, Next **rewrites** `/api/*` and `/uploads/*` to the API base URL (`API_INTERNAL_URL`).

## Local

From repo root: `npm run dev`  
Or from this folder: `npm run dev` (ensure API is already running on port 3001, or set `API_INTERNAL_URL`).

## Build

From root: `npm run build`  
Or: `npm run build` here (API should be built first if you rely on a full stack build from root).

## Production API URL

Set **`API_INTERNAL_URL`** to your deployed Express base (example: `https://buddy-script-a-social-platform-production.up.railway.app`). Railway / CI must provide this **at build time** as well as runtime so `next.config` rewrites and optional image hosts resolve correctly.

On **`apps/api`**, set **`WEB_ORIGIN`** to the exact origin users use in the browser (your Next app URL) so CORS and auth cookies work.

See the [root README](../../README.md) for the monorepo overview.
