import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { AuthenticatedBuddyLayout } from "@/components/layout/AuthenticatedBuddyLayout";

export const dynamic = "force-dynamic";

async function hasApiSession() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return false;

  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");

  try {
    const res = await fetch(`${proto}://${host}/api/auth/me`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Server-side auth source of truth is `/api/auth/me` (API-verified cookie), which avoids env-secret mismatches across web/API deploys. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessionOk = await hasApiSession();
  if (!sessionOk) {
    redirect("/login");
  }
  return <AuthenticatedBuddyLayout>{children}</AuthenticatedBuddyLayout>;
}
