"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedNav } from "@/components/feed/FeedNav";
import type { PublicUser } from "@/components/feed/feed-types";
import { displayName } from "@/components/feed/feed-types";
import { UserAvatar } from "@/components/ui/UserAvatar";

const fetchOpts: RequestInit = { credentials: "include" };

export function ProfilePageClient() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetch("/api/auth/me", fetchOpts);
      const ud = await u.json();
      if (cancelled) return;
      if (!u.ok || !ud.user) {
        router.push("/login");
        return;
      }
      setMe(ud.user);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-14 animate-pulse border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <FeedNav user={me} />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 dark:shadow-card-dark">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 sm:h-40" />
          <div className="relative px-5 pb-8 pt-0 sm:px-8">
            <div className="relative -mt-12 flex flex-col items-center sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
              <UserAvatar user={me} size={96} shape="rounded-full" className="ring-4 ring-white shadow-lg dark:ring-slate-900" />
              <div className="mt-4 text-center sm:mb-2 sm:mt-0 sm:flex-1 sm:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName(me)}</h1>
                {me.email ? <p className="mt-1 text-slate-600 dark:text-slate-400">{me.email}</p> : null}
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This is your Buddy profile. Account details (name, email, password) are managed here in the future; for
                now use the feed to share posts and comments.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/feed"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Back to feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
