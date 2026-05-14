import type { NextConfig } from "next";

/** Build-time: set `NEXT_API_BASE_URL` on Vercel for "Build" so `/uploads` rewrites and image hosts match production. Legacy: `API_INTERNAL_URL`. */
const nextApiBase =
  (process.env["NEXT_API_BASE_URL"] as string | undefined)?.trim().replace(/\/$/, "") || "";
const legacyApiBase =
  (process.env["API_INTERNAL_URL"] as string | undefined)?.trim().replace(/\/$/, "") || "";
const apiInternal =
  nextApiBase ||
  legacyApiBase ||
  (process.env.VERCEL
    ? (() => {
        throw new Error(
          "NEXT_API_BASE_URL is required on Vercel. Add it in Project → Environment Variables and enable it for **Building** (and each runtime environment), then redeploy.",
        );
      })()
    : "http://127.0.0.1:3001");

/** Allow `next/image` (if used) to load absolute URLs from the same host as the API base. */
function apiRemotePattern():
  | { protocol: "http" | "https"; hostname: string; port?: string; pathname: string }
  | undefined {
  try {
    const u = new URL(apiInternal);
    const protocol = u.protocol === "https:" ? ("https" as const) : ("http" as const);
    const entry: { protocol: typeof protocol; hostname: string; port?: string; pathname: string } = {
      protocol,
      hostname: u.hostname,
      pathname: "/**",
    };
    if (u.port) entry.port = u.port;
    return entry;
  } catch {
    return undefined;
  }
}

const apiPattern = apiRemotePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      ...(apiPattern ? [apiPattern] : []),
    ],
  },
  async rewrites() {
    return {
      /** `/api/*` is proxied by `app/api/[...path]/route.ts` (see `lib/api-proxy.ts`). */
      fallback: [{ source: "/uploads/:path*", destination: `${apiInternal}/uploads/:path*` }],
    };
  },
};

export default nextConfig;

