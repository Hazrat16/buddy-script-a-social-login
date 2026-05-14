# Brief project documentation

This document summarizes what the **social-app** monorepo implements, why key decisions were made, and where to find full setup instructions.

---

## What was built

A full-stack social feed application derived from the provided **Login**, **Register**, and **Feed** designs. The marketing auth pages expose clear **Login** and **Register** entry points and allow users to switch between sign-in and sign-up. After authentication, users access a **protected feed** where they can publish and interact with content.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | **Next.js** (`apps/web`) — UI, server components / routes as used in the app |
| Backend | **Express** REST API (`apps/api`) |
| ORM / DB | **Prisma** + **PostgreSQL** |
| Auth | **JWT** signed with `jose`, delivered as an **httpOnly** session cookie (not localStorage) |
| Passwords | **bcryptjs** (hashed at rest; never stored in plain text) |

The web app calls the API through Next.js **rewrites** so the browser talks to one origin (`localhost:3000`) while `/api` and `/uploads` are proxied to the Express server (default **3001**).

---

## Features (requirement mapping)

### Authentication and authorization

- **Registration:** first name, last name, email, password.
- **Login / logout** with session invalidation via cookie.
- **No** “forgot password” or email verification (out of scope for the brief).
- **Feed and related APIs** require a valid session; unauthenticated users are redirected to login.

### Feed

- **Global timeline:** users see posts from others according to visibility rules below.
- **Ordering:** posts returned **newest first** (backed by a `createdAt` index).
- **Create post:** text plus optional **image** (local `uploads` by default; optional **Cloudinary** for hosted URLs — see `apps/api/README.md`).
- **Visibility:** `PUBLIC` (everyone) or `PRIVATE` (author only). Enforced in the API when listing and when resolving single posts.
- **Likes:** toggle like/unlike on posts; **who liked** is exposed for display.
- **Comments and replies:** comments are tied to a post; **replies** use `parentId` on the same `Comment` model (threaded under a top-level comment).
- **Comment likes:** same pattern as post likes, with liker identity available for the UI.

---

## Data model (high level)

- **User** — identity, `passwordHash`, profile fields (`firstName`, `lastName`, `email` unique).
- **Post** — `body`, optional `imageUrl`, `visibility` (`PUBLIC` | `PRIVATE`), `authorId`, timestamps.
- **PostLike** — `@@unique([postId, userId])` so each user likes a post at most once.
- **Comment** — `postId`, `userId`, `body`, optional `parentId` for replies.
- **CommentLike** — `@@unique([commentId, userId])` for comment/reply likes.

Relevant Prisma definitions: `apps/api/prisma/schema.prisma`.

---

## Security and UX priorities

- **HttpOnly cookie** for the JWT reduces XSS exfiltration risk compared to storing tokens in `localStorage`.
- **CORS** is constrained using `WEB_ORIGIN` so only the configured web origin is accepted for credentialed browser calls.
- **`AUTH_SECRET`** must be a long random string (≥ 32 characters) and **match** between API and web for session verification.
- **Input validation** on auth and content endpoints; uploads should stay behind size/type limits (see API code and README).

---

## Performance and scale (design intent)

The schema includes indexes aimed at common read paths:

- Posts: `createdAt` descending for **newest-first** feeds.
- Posts: `[authorId, visibility]` to support **author + visibility** filters efficiently.
- Likes and comments: indexes on foreign keys / lookup columns to keep like lists and comment threads cheaper at scale.

For **millions of posts**, the next incremental steps would be **cursor-based pagination** on the feed, read replicas or caching for hot timelines, and **object storage + CDN** for images (Cloudinary or S3) rather than serving large files from the API process.

---

## How to run and deploy

Detailed local setup (env vars, Docker Postgres, `npm run dev`, troubleshooting) is in the **[root README](../README.md)**. API-specific notes (uploads, Cloudinary): **`apps/api/README.md`**. Web / production hosting notes: **`apps/web/README.md`**.

---

## Deliverables checklist

| Item | Where |
|------|--------|
| Source code | This repository |
| Video walkthrough | *[Add your unlisted/private YouTube URL]* |
| Live deployment | *[Add URL if deployed; otherwise note “local only”]* |

---

## Known limitations (honest scope)

- No password reset, email confirmation, or OAuth.
- Rate limiting and WAF-style protections are not described here; add them before a public production launch.
- Feed pagination strategy should be confirmed under load; indexes support growth but API contracts may still return fixed windows unless extended.
