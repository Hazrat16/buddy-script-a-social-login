import type { NextConfig } from "next";

const apiInternal = (process.env.API_INTERNAL_URL || "http://127.0.0.1:3001").replace(/\/$/, "");

/** Allow `next/image` (if used) to load absolute URLs from the same host as `API_INTERNAL_URL`. */
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
      /** `/api/*` is proxied by `app/api/[[...path]]/route.ts` (see `lib/api-proxy.ts`). */
      fallback: [{ source: "/uploads/:path*", destination: `${apiInternal}/uploads/:path*` }],
    };
  },
};

export default nextConfig;

