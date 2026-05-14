"use client";

import Link from "next/link";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";

const explore = [
  { href: "#", label: "Learning", badge: "New", icon: "compass" as const },
  { href: "#", label: "Insights", icon: "chart" as const },
  { href: "/find-friends", label: "Find friends", icon: "users" as const },
  { href: "/saved", label: "Bookmarks", icon: "bookmark" as const },
  { href: "#", label: "Group", icon: "group" as const },
  { href: "#", label: "Gaming", badge: "New", icon: "game" as const },
  { href: "/settings", label: "Settings", icon: "gear" as const },
  { href: "/saved", label: "Save post", icon: "save" as const },
];

function ExploreIcon({ kind }: { kind: "compass" | "chart" | "users" | "bookmark" | "group" | "game" | "gear" | "save" }) {
  const cls = "h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400";
  switch (kind) {
    case "compass":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1.5 4.67L4.1 15.9l11.23-4.4-4.4-11.23zm1.06 6.16l-1.73-1.73 2.87-2.87 1.73 1.73-2.87 2.87z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 22 24">
          <path d="M14.96 2c3.1 0 5.16 2.42 5.16 5.89v8.21c0 3.48-2.06 5.9-5.16 5.9H6.99c-3.1 0-5.16-2.42-5.16-5.9V7.89C1.83 4.42 3.89 2 6.99 2h7.97z" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "bookmark":
      return (
        <svg className={cls} fill="none" viewBox="0 0 22 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.7 2c2.8 0 4.59 1.44 4.59 4.26V20.33c0 .44-.16.87-.44 1.18-.28.31-.66.49-1.06.49-.25 0-.5-.07-.71-.2l-5.13-3.14-5.11 3.14c-.62.36-1.36.19-1.83-.41a1.9 1.9 0 01-.18-.79V6.43C3.66 3.5 5.4 2 8.24 2h5.46z" />
        </svg>
      );
    case "group":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "game":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0016.53 5H7.47C5.48 5 3.89 6.45 3.51 8.43l-1.09 7.66A2.545 2.545 0 004.96 19h4.24c.81 0 1.53-.5 1.84-1.22l.91-2.04h1.1l.91 2.04c.31.72 1.03 1.22 1.84 1.22h4.24c1.22 0 2.15-1.09 1.98-2.31zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1h-1v1h1v-1zm2 1h-1v1h1v-1zm-2 2h-1v1h1v-1z" />
        </svg>
      );
    case "gear":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.6.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.3.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-5 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-9 9h.01M12 12h.01M16 12h.01" />
        </svg>
      );
  }
}

export function FeedLeftAside({ suggested }: { suggested: PublicUser[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Explore</h2>
        <ul className="mt-4 space-y-0.5">
          {explore.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ExploreIcon kind={item.icon} />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="shrink-0 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Suggested people</h2>
          <Link href="/find-friends" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            See all
          </Link>
        </div>
        <ul className="space-y-4">
          {suggested.slice(0, 4).map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <Link href="/find-friends" className="shrink-0">
                <UserAvatar user={u} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href="/find-friends" className="block truncate font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                  {displayName(u)}
                </Link>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.postCount ?? 0} public posts</p>
              </div>
              <Link
                href="/find-friends"
                className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
              >
                Connect
              </Link>
            </li>
          ))}
          {suggested.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No suggestions yet.</p> : null}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Events</h2>
          <span className="text-xs font-semibold text-slate-400">Soon</span>
        </div>
        <Link
          href="#"
          className="block overflow-hidden rounded-xl border border-slate-100 transition hover:border-indigo-200 dark:border-slate-800 dark:hover:border-indigo-900"
          onClick={(e) => e.preventDefault()}
        >
          <div className="flex gap-3 p-3">
            <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="text-lg font-bold leading-none">14</span>
              <span className="text-[10px] font-medium uppercase opacity-90">May</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">Community meetup</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Buddy social · Online</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
            <span className="text-slate-500">0 going</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">RSVP</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
