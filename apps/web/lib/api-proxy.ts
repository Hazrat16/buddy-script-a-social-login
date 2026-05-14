import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isThisVercelAppHost, readApiBackendBaseFromEnv } from "@/lib/api-backend-env";

/**
 * Resolve at **request time** (not module load). See `lib/api-backend-env.ts` for env names.
 * On Vercel, a base URL is **required** — never default to localhost (that would hide a missing env).
 */
function getBackendBase(): string | null {
  const fromEnv = readApiBackendBaseFromEnv();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL) {
    return null;
  }
  return "http://127.0.0.1:3001";
}

/** Headers that must not be forwarded to Node fetch / upstream. */
const hopByHop = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function forwardHeaders(request: NextRequest): Headers {
  const out = new Headers();
  request.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) out.set(key, value);
  });
  return out;
}

/**
 * Forwards the incoming `/api/...` request to the Express app (`BACKEND_API_URL` / `NEXT_API_BASE_URL`).
 * This replaces `next.config` rewrites so routing is explicit and always hits your API code.
 */
export async function proxyApiRequest(request: NextRequest): Promise<Response> {
  const backend = getBackendBase();
  if (backend === null) {
    return NextResponse.json(
      {
        error: "API base URL is not configured",
        hint:
          "On Vercel, set BACKEND_API_URL (recommended) or NEXT_API_BASE_URL to your **Express** origin (e.g. https://….up.railway.app), **not** your Vercel site URL. Enable for Production, Preview, and Build, then redeploy.",
      },
      { status: 503 },
    );
  }
  if (isThisVercelAppHost(backend)) {
    return NextResponse.json(
      {
        error: "API base URL points at this Next app on Vercel",
        hint:
          "You set BACKEND_API_URL / NEXT_API_BASE_URL to the same host as the frontend (vercel.app). That proxies /api to itself. Set it to your separate API server only (Railway URL).",
        vercelUrl: process.env.VERCEL_URL ?? null,
      },
      { status: 503 },
    );
  }
  const target = `${backend}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const headers = forwardHeaders(request);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const res = await fetch(target, init);
    const outHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (hopByHop.has(k)) return;
      // Never use set() for Set-Cookie: upstream may send multiple; set() keeps only the last.
      if (k === "set-cookie") return;
      outHeaders.set(key, value);
    });
    const cookies = res.headers.getSetCookie?.() ?? [];
    for (const c of cookies) {
      outHeaders.append("Set-Cookie", c);
    }

    try {
      outHeaders.set("x-upstream-host", new URL(backend).hostname);
      /** Full origin Next used for upstream fetch — use `curl -i` to confirm prod vs local API. */
      outHeaders.set("x-upstream-base", backend);
    } catch {
      /* ignore */
    }
    outHeaders.set("x-proxied-by", "nextjs");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: outHeaders,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Cannot reach API backend",
        upstreamHost: (() => {
          try {
            return new URL(backend).hostname;
          } catch {
            return "invalid-backend-url";
          }
        })(),
        hint: `Check that the API is running and BACKEND_API_URL / NEXT_API_BASE_URL matches it (currently targeting ${backend}).`,
        detail: msg,
      },
      { status: 502 },
    );
  }
}
