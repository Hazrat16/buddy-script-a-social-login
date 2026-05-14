import type { NextRequest } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    return proxyApiRequest(request);
}

export async function HEAD(request: NextRequest) {
    return proxyApiRequest(request);
}
