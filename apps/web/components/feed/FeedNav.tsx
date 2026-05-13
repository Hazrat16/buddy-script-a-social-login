"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";

export function FeedNav({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/feed" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white shadow-sm">B</span>
          <span className="hidden sm:inline">Buddy</span>
        </Link>

        <div className="hidden flex-1 justify-center sm:flex md:max-w-md">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              disabled
              placeholder="Search (soon)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
            onClick={() => document.documentElement.classList.toggle("dark")}
          >
            <svg className="hidden h-5 w-5 dark:block" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm5.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM18 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.828 5.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM11 18a1 1 0 102 0v-1a1 1 0 10-2 0v1zm-5.657-2.343a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM6 11a1 1 0 100-2H5a1 1 0 000 2h1zm2.828-5.657a1 1 0 011.414 0l.707.707A1 1 0 118.535 7.464l-.707-.707a1 1 0 010-1.414zM12 6a6 6 0 100 12 6 6 0 000-12z" />
            </svg>
            <svg className="h-5 w-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <Link
            href="/feed"
            className="hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 sm:inline-flex"
            aria-label="Home feed"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 sm:pr-3"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              aria-expanded={open}
            >
              <UserAvatar user={user} size={36} />
              <span className="hidden max-w-[140px] truncate text-left text-sm font-medium text-slate-800 dark:text-slate-100 sm:block">
                {displayName(user)}
              </span>
              <svg className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200/90 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{displayName(user)}</p>
                  {user.email ? (
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  ) : null}
                  <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">{initials}</p>
                </div>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  onClick={() => void logout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Signing out…" : "Log out"}
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:hidden">
          <input
            type="search"
            disabled
            placeholder="Search (soon)"
            className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <Link href="/feed" className="block rounded-xl py-2 text-sm font-medium text-indigo-600" onClick={() => setMobileOpen(false)}>
            Feed home
          </Link>
        </div>
      ) : null}
    </header>
  );
}
