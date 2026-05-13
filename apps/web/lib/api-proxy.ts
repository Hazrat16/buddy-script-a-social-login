import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const backend = (process.env.API_INTERNAL_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

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
        hint: `Check that the API is running and API_INTERNAL_URL matches it (currently targeting ${backend}).`,
        detail: msg,
      },
      { status: 502 },
    );
  }
}
