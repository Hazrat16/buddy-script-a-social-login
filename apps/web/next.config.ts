import type { NextConfig } from "next";

const apiInternal = process.env.API_INTERNAL_URL || "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
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

