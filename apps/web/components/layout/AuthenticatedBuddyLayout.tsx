"use client";

import { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/components/feed/feed-types";
import { BuddyAppFrame } from "@/components/feed/buddy/BuddyAppFrame";
import { useBuddyFeedAssets } from "@/components/feed/buddy/useBuddyFeedAssets";
import { ComingSoonProvider } from "@/components/ui/ComingSoonProvider";

const fetchOpts: RequestInit = { credentials: "include" };

/** Set for all routes under `(app)` once `/api/auth/me` succeeds (see `AuthenticatedBuddyLayout`). */
export const BuddyUserContext = createContext<PublicUser | null>(null);

export function useBuddyUser(): PublicUser | null {
  return useContext(BuddyUserContext);
}

export function AuthenticatedBuddyLayout({ children }: { children: React.ReactNode }) {
  useBuddyFeedAssets(true);
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<PublicUser | null>(null);

  const isFeedRoute = pathname === "/feed" || pathname.startsWith("/feed/");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const load = async () => {
        const u = await fetch("/api/auth/me", fetchOpts);
        return { u, ud: (await u.json()) as { user?: PublicUser } };
      };
      let { u, ud } = await load();
      if (cancelled) return;
      if ((!u.ok || !ud.user) && u.status === 401) {
        await new Promise((r) => setTimeout(r, 200));
        if (cancelled) return;
        ({ u, ud } = await load());
      }
      if (cancelled) return;
      if (!u.ok || !ud.user) {
        router.replace("/login");
        return;
      }
      setMe(ud.user as PublicUser);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="h-14 animate-pulse border-b border-slate-200/80 bg-white/80" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isFeedRoute) {
    return (
      <BuddyUserContext.Provider value={me}>
        <ComingSoonProvider>
          <BuddyAppFrame user={me}>{children}</BuddyAppFrame>
        </ComingSoonProvider>
      </BuddyUserContext.Provider>
    );
  }

  return (
    <BuddyUserContext.Provider value={me}>
      <ComingSoonProvider>
        <BuddyAppFrame user={me}>
          <div className="container _custom_container">
            <div className="_layout_inner_wrap">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_layout_middle_wrap">
                    <div className="_layout_middle_inner _padd_t24 _padd_b24">{children}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BuddyAppFrame>
      </ComingSoonProvider>
    </BuddyUserContext.Provider>
  );
}
