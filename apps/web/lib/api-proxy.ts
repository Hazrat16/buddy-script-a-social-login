import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Resolve at **request time** (not module load). Prefer `NEXT_API_BASE_URL`; `API_INTERNAL_URL` is still read as a legacy fallback.
 * On Vercel, a base URL is **required** — never default to localhost (that would hide a missing env and bypass Railway).
 */
function getBackendBase(): string | null {
  const raw =
    process.env["NEXT_API_BASE_URL"]?.trim() || process.env["API_INTERNAL_URL"]?.trim();
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/$/, "");
  }
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
 * Forwards the incoming `/api/...` request to the Express app (`NEXT_API_BASE_URL`).
 * This replaces `next.config` rewrites so routing is explicit and always hits your API code.
 */
export async function proxyApiRequest(request: NextRequest): Promise<Response> {
  const backend = getBackendBase();
  if (backend === null) {
    return NextResponse.json(
      {
        error: "API base URL is not configured",
        hint:
          "On Vercel, set NEXT_API_BASE_URL to your API origin (e.g. https://…railway.app) for **Production**, **Preview**, and **Build**, then redeploy.",
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
            return "invalid-NEXT_API_BASE_URL";
          }
        })(),
        hint: `Check that the API is running and NEXT_API_BASE_URL matches it (currently targeting ${backend}).`,
        detail: msg,
      },
      { status: 502 },
    );
  }
}
