import type { NextConfig } from "next";

import { isThisVercelAppHost, isVercelProductionDeploy, readApiBackendBaseFromEnv } from "./lib/api-backend-env";

/** Build-time: set `BACKEND_API_URL` (or `NEXT_API_BASE_URL`) on Vercel for "Build" so `/uploads` rewrites and image hosts match production. */
const resolved = readApiBackendBaseFromEnv();
if (resolved && isThisVercelAppHost(resolved)) {
  throw new Error(
    "BACKEND_API_URL / NEXT_API_BASE_URL must be your Express API host (e.g. Railway), not this app's Vercel host (see VERCEL_URL).",
  );
}
const apiInternal =
  resolved ||
  (isVercelProductionDeploy()
    ? (() => {
        throw new Error(
          "BACKEND_API_URL or NEXT_API_BASE_URL is required on Vercel. Add it in Project → Environment Variables and enable it for **Building** (and each runtime environment), then redeploy. Use your Railway / Express URL, not the Vercel site URL.",
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

