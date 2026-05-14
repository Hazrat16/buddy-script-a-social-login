"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";

function onlineDot(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 3 !== 0;
}

export function FeedRightAside({ users }: { users: PublicUser[] }) {
  const router = useRouter();
  const [ignored, setIgnored] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const might = users.slice(0, 2);
  const friends = users.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">You might like</h2>
          <Link href="/find-friends" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            See all
          </Link>
        </div>
        <hr className="mb-4 border-slate-100 dark:border-slate-800" />
        {might.map((u) =>
          ignored[u.id] ? null : (
            <div key={u.id} className="mb-4 last:mb-0">
              <div className="flex gap-3">
                <Link href="/find-friends" className="shrink-0">
                  <UserAvatar user={u} size={48} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href="/find-friends" className="block truncate font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                    {displayName(u)}
                  </Link>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">Member · {u.postCount ?? 0} posts</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => setIgnored((m) => ({ ...m, [u.id]: true }))}
                    >
                      Ignore
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        followed[u.id]
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                      onClick={() => {
                        setFollowed((m) => ({ ...m, [u.id]: true }));
                        router.push("/find-friends");
                      }}
                    >
                      {followed[u.id] ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
        {might.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">Discover people in Find friends.</p> : null}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your friends</h2>
          <Link href="/find-friends" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            See all
          </Link>
        </div>
        <div className="relative mb-3">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            readOnly
            placeholder="Search friends (soon)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          />
        </div>
        <ul className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
          {friends.map((u) => {
            const on = onlineDot(u.id);
            return (
              <li key={u.id}>
                <Link
                  href="/messages"
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/80"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UserAvatar user={u} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName(u)}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{on ? "Active now" : "Recently active"}</span>
                    </span>
                  </span>
                  {on ? (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Online" />
                  ) : (
                    <span className="shrink-0 text-[10px] text-slate-400">5m</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
