import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isThisVercelAppHost, isVercelProductionDeploy, readApiBackendBaseFromEnv } from "@/lib/api-backend-env";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session-cookie";
function describeFetchFailure(err: unknown): string {
    if (!(err instanceof Error))
        return String(err);
    const parts: string[] = [err.message];
    let cursor: unknown = err.cause;
    for (let i = 0; i < 5 && cursor; i++) {
        if (cursor instanceof Error) {
            const code = "code" in cursor && typeof (cursor as NodeJS.ErrnoException).code === "string"
                ? (cursor as NodeJS.ErrnoException).code
                : undefined;
            parts.push(code ? `${cursor.message} (${code})` : cursor.message);
            cursor = cursor.cause;
        }
        else if (typeof cursor === "object" && cursor !== null && "code" in cursor) {
            parts.push(`code=${String((cursor as {
                code: unknown;
            }).code)}`);
            break;
        }
        else {
            parts.push(String(cursor));
            break;
        }
    }
    return parts.join(" | ");
}
function getBackendBase(): string | null {
    const fromEnv = readApiBackendBaseFromEnv();
    if (fromEnv)
        return fromEnv;
    if (isVercelProductionDeploy()) {
        return null;
    }
    return "http://127.0.0.1:3001";
}
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
        if (!hopByHop.has(key.toLowerCase()))
            out.set(key, value);
    });
    return out;
}
function getUpstreamSetCookieLines(res: Response): string[] {
    if (typeof res.headers.getSetCookie === "function") {
        const list = res.headers.getSetCookie();
        if (list.length > 0)
            return list;
    }
    const single = res.headers.get("set-cookie");
    return single ? [single] : [];
}
function parseFirstCookiePair(line: string): {
    name: string;
    value: string;
} | null {
    const eq = line.indexOf("=");
    if (eq < 1)
        return null;
    const name = line.slice(0, eq).trim();
    const rest = line.slice(eq + 1);
    const semi = rest.indexOf(";");
    const encoded = (semi === -1 ? rest : rest.slice(0, semi)).trim();
    try {
        return { name, value: decodeURIComponent(encoded) };
    }
    catch {
        return { name, value: encoded };
    }
}
function attachUpstreamCookies(upstream: Response, outHeaders: Headers): NextResponse {
    const lines = getUpstreamSetCookieLines(upstream);
    for (const line of lines) {
        const pair = parseFirstCookiePair(line);
        if (pair?.name === SESSION_COOKIE)
            continue;
        outHeaders.append("Set-Cookie", line);
    }
    const nextRes = new NextResponse(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outHeaders,
    });
    for (const line of lines) {
        const pair = parseFirstCookiePair(line);
        if (pair?.name !== SESSION_COOKIE)
            continue;
        if (!pair.value) {
            nextRes.cookies.delete(SESSION_COOKIE);
        }
        else {
            nextRes.cookies.set(SESSION_COOKIE, pair.value, sessionCookieOptions);
        }
    }
    return nextRes;
}
export async function proxyApiRequest(request: NextRequest): Promise<Response> {
    const backend = getBackendBase();
    if (backend === null) {
        return NextResponse.json({
            error: "API base URL is not configured",
            hint: "On Vercel production, set BACKEND_API_URL or NEXT_API_BASE_URL to your **Express** origin (e.g. https://….up.railway.app), **not** your Vercel site URL. Enable for Production, Preview, and Build, then redeploy.",
        }, { status: 503 });
    }
    if (isThisVercelAppHost(backend)) {
        return NextResponse.json({
            error: "API base URL points at this Next app on Vercel",
            hint: "You set BACKEND_API_URL / NEXT_API_BASE_URL to the same host as the frontend (vercel.app). That proxies /api to itself. Set it to your separate API server only (Railway URL).",
            vercelUrl: process.env.VERCEL_URL ?? null,
        }, { status: 503 });
    }
    const target = `${backend}${request.nextUrl.pathname}${request.nextUrl.search}`;
    const headers = forwardHeaders(request);
    let upstreamBody: ArrayBuffer | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
        upstreamBody = await request.arrayBuffer();
        if (upstreamBody.byteLength > 0) {
            headers.delete("content-length");
            headers.delete("transfer-encoding");
        }
    }
    const init: RequestInit = {
        method: request.method,
        headers,
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(55000),
        ...(upstreamBody !== undefined && upstreamBody.byteLength > 0 ? { body: upstreamBody } : {}),
    };
    try {
        const res = await fetch(target, init);
        const outHeaders = new Headers();
        res.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            if (hopByHop.has(k))
                return;
            if (k === "set-cookie")
                return;
            outHeaders.set(key, value);
        });
        try {
            outHeaders.set("x-upstream-host", new URL(backend).hostname);
            outHeaders.set("x-upstream-base", backend);
        }
        catch {
        }
        outHeaders.set("x-proxied-by", "nextjs");
        return attachUpstreamCookies(res, outHeaders);
    }
    catch (err) {
        const detail = describeFetchFailure(err);
        const isTimeout = detail.includes("AbortError") ||
            detail.includes("The operation was aborted") ||
            detail.includes("ETIMEDOUT") ||
            detail.includes("UND_ERR_CONNECT_TIMEOUT");
        return NextResponse.json({
            error: "Cannot reach API backend",
            upstreamHost: (() => {
                try {
                    return new URL(backend).hostname;
                }
                catch {
                    return "invalid-backend-url";
                }
            })(),
            hint: isTimeout
                ? `Upstream did not respond in time (${backend}). Vercel Hobby limits serverless duration (~10s); Railway cold starts often exceed that. Try: open ${backend}/health in a browser to wake the service, upgrade Vercel for a higher maxDuration, or add a Railway cron hitting /health.`
                : `Check that the API is deployed and healthy: ${backend}/health — then confirm BACKEND_API_URL / NEXT_API_BASE_URL on Vercel matches that host exactly (https, no trailing path).`,
            detail,
        }, { status: 502 });
    }
}
