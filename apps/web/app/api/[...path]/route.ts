import type { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow slow Railway cold starts when your Vercel plan supports it (Hobby still caps ~10s). */
export const maxDuration = 60;

function handle(request: NextRequest) {
  return proxyApiRequest(request);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
