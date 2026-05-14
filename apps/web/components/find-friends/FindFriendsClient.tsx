"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicUser } from "@/components/feed/feed-types";
import { displayName } from "@/components/feed/feed-types";
import { UserAvatar } from "@/components/ui/UserAvatar";
const fetchOpts: RequestInit = { credentials: "include" };

export function FindFriendsClient() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (term: string) => {
    setLoading(true);
    try {
      const url = new URL("/api/users", window.location.origin);
      url.searchParams.set("limit", "40");
      if (term.trim()) url.searchParams.set("search", term.trim());
      const res = await fetch(url.toString(), fetchOpts);
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) setUsers(data.users as PublicUser[]);
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      await search("");
    })();
    return () => {
      cancelled = true;
    };
  }, [router, search]);

  const skipFirstQ = useRef(true);

  useEffect(() => {
    if (!me) return;
    if (skipFirstQ.current) {
      skipFirstQ.current = false;
      return;
    }
    const t = window.setTimeout(() => void search(q), 320);
    return () => window.clearTimeout(t);
  }, [q, me, search]);

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href="/feed" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          ← Back to feed
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Find friends</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Search everyone on Buddy (excluding you).</p>
        <div className="relative mt-6">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <ul className="mt-8 space-y-3">
          {loading ? (
            <li className="text-center text-sm text-slate-500">Loading…</li>
          ) : users.length === 0 ? (
            <li className="text-center text-sm text-slate-500">No users match that search.</li>
          ) : (
            users.map((u) => (
              <li key={u.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <UserAvatar user={u} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{displayName(u)}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                  title="Follow is coming soon"
                >
                  Connect
                </button>
              </li>
            ))
          )}
        </ul>
    </div>
  );
}
