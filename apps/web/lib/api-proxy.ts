import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Resolve at **request time** (not module load). Next/Vercel can inline `process.env.API_INTERNAL_URL`
 * at build if read as a static member; bracket access + reading inside the handler avoids a baked-in
 * `http://127.0.0.1:3001` when the var was only set for runtime on Vercel.
 */
function getBackendBase(): string {
  const raw = process.env["API_INTERNAL_URL"];
  const s = typeof raw === "string" && raw.trim() ? raw.trim() : "http://127.0.0.1:3001";
  return s.replace(/\/$/, "");
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
 * Forwards the incoming `/api/...` request to the Express app (`API_INTERNAL_URL`).
 * This replaces `next.config` rewrites so routing is explicit and always hits your API code.
 */
export async function proxyApiRequest(request: NextRequest): Promise<Response> {
  const backend = getBackendBase();
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
      if (!hopByHop.has(key.toLowerCase())) outHeaders.set(key, value);
    });

    try {
      outHeaders.set("x-upstream-host", new URL(backend).hostname);
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
    const onVercel = Boolean(process.env.VERCEL);
    const missingUpstream = onVercel && !process.env["API_INTERNAL_URL"]?.trim();
    return NextResponse.json(
      {
        error: "Cannot reach API backend",
        upstreamHost: (() => {
          try {
            return new URL(backend).hostname;
          } catch {
            return "invalid-API_INTERNAL_URL";
          }
        })(),
        hint: missingUpstream
          ? "On Vercel, set API_INTERNAL_URL to your Railway API URL and enable it for **Build** and **Production**, then redeploy. (Otherwise the proxy may fall back to localhost.)"
          : `Check that the API is running and API_INTERNAL_URL matches it (currently targeting ${backend}).`,
        detail: msg,
      },
      { status: 502 },
    );
  }
}
