# Web (Next.js)

Frontend only. All REST endpoints live in **`apps/api`** (Express). In development and production, Next **rewrites** `/api/*` and `/uploads/*` to the API base URL (`API_INTERNAL_URL`).

## Local

From repo root: `npm run dev`  
Or from this folder: `npm run dev` (ensure API is already running on port 3001, or set `API_INTERNAL_URL`).

## Build

From root: `npm run build`  
Or: `npm run build` here (API should be built first if you rely on a full stack build from root).

See the [root README](../../README.md) for the monorepo overview.
