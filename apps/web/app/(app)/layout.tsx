import { redirect } from "next/navigation";

import { AuthenticatedBuddyLayout } from "@/components/layout/AuthenticatedBuddyLayout";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Auth runs here (Node server) so `AUTH_SECRET` + `cookies()` match production; Edge `middleware` often lacked `AUTH_SECRET` on Vercel. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return <AuthenticatedBuddyLayout>{children}</AuthenticatedBuddyLayout>;
}
