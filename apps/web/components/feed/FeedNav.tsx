"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";
import { loadNotifications, markAllNotificationsRead, persistNotifications, type FeedNotificationItem, } from "@/lib/feed-notifications";
import { formatRelativeTime } from "./format";
export function FeedNav({ user }: {
    user: PublicUser;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifTab, setNotifTab] = useState<"all" | "unread">("all");
    const [notifMenu, setNotifMenu] = useState(false);
    const [items, setItems] = useState<FeedNotificationItem[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const refreshNotifs = useCallback(() => {
        setItems(loadNotifications());
    }, []);
    useEffect(() => {
        refreshNotifs();
    }, [refreshNotifs]);
    useEffect(() => {
        function onBuddyOpenNotif() {
            setNotifOpen(true);
            refreshNotifs();
        }
        window.addEventListener("buddy:open-notifications", onBuddyOpenNotif);
        return () => window.removeEventListener("buddy:open-notifications", onBuddyOpenNotif);
    }, [refreshNotifs]);
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!menuRef.current?.contains(e.target as Node))
                setOpen(false);
            if (!notifRef.current?.contains(e.target as Node)) {
                setNotifOpen(false);
                setNotifMenu(false);
            }
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
    const filtered = notifTab === "unread" ? items.filter((n) => !n.read) : items;
    const unreadCount = items.filter((n) => !n.read).length;
    function markAllRead() {
        const next = markAllNotificationsRead(items);
        setItems(next);
        persistNotifications(next);
        setNotifMenu(false);
        window.dispatchEvent(new Event("buddy:notifications-changed"));
    }
    return (<header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/85 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/feed" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white shadow-sm">B</span>
          <span className="hidden sm:inline">Buddy</span>
        </Link>

        <div className="hidden flex-1 justify-center sm:flex md:max-w-md">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input type="search" disabled placeholder="Search (soon)" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400"/>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" className="hidden rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex" aria-label="Toggle dark mode" onClick={() => document.documentElement.classList.toggle("dark")}>
            <svg className="hidden h-5 w-5 dark:block" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm5.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM18 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.828 5.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM11 18a1 1 0 102 0v-1a1 1 0 10-2 0v1zm-5.657-2.343a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM6 11a1 1 0 100-2H5a1 1 0 000 2h1zm2.828-5.657a1 1 0 011.414 0l.707.707A1 1 0 118.535 7.464l-.707-.707a1 1 0 010-1.414zM12 6a6 6 0 100 12 6 6 0 000-12z"/>
            </svg>
            <svg className="h-5 w-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          </button>

          <Link href="/feed" className="hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 sm:inline-flex" aria-label="Home feed">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </Link>

          <Link href="/find-friends" className="hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 sm:inline-flex" aria-label="Friend requests" title="Find friends">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </Link>

          <div className="relative" ref={notifRef}>
            <button type="button" className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-expanded={notifOpen} aria-label="Notifications" onClick={(e) => {
            e.stopPropagation();
            setNotifOpen((v) => !v);
            refreshNotifs();
        }}>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              {unreadCount > 0 ? (<span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>) : null}
            </button>

            {notifOpen ? (<div className="absolute right-0 mt-2 w-[min(100vw-2rem,380px)] origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
                  <div className="relative">
                    <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notification options" onClick={(e) => {
                e.stopPropagation();
                setNotifMenu((m) => !m);
            }}>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="18" r="1.5"/>
                      </svg>
                    </button>
                    {notifMenu ? (<div className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800">
                        <button type="button" className="block w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => markAllRead()}>
                          Mark all as read
                        </button>
                        <Link href="/settings" className="block px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setNotifOpen(false)}>
                          Notification settings
                        </Link>
                        <button type="button" className="block w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setNotifOpen(true)}>
                          Open notifications
                        </button>
                      </div>) : null}
                  </div>
                </div>
                <div className="flex gap-1 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <button type="button" className={`rounded-full px-4 py-1.5 text-xs font-bold ${notifTab === "all" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`} onClick={() => setNotifTab("all")}>
                    All
                  </button>
                  <button type="button" className={`rounded-full px-4 py-1.5 text-xs font-bold ${notifTab === "unread" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`} onClick={() => setNotifTab("unread")}>
                    Unread
                  </button>
                </div>
                <ul className="max-h-[min(60vh,360px)] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                  {filtered.length === 0 ? (<li className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications here.</li>) : (filtered.map((n) => (<li key={n.id}>
                        <button type="button" className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80" onClick={() => {
                    const next = items.map((x) => (x.id === n.id ? { ...x, read: true } : x));
                    setItems(next);
                    persistNotifications(next);
                    router.push("/feed");
                    setNotifOpen(false);
                    window.dispatchEvent(new Event("buddy:notifications-changed"));
                }}>
                          <UserAvatar user={user} size={40}/>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-snug ${n.read ? "text-slate-600 dark:text-slate-400" : "font-semibold text-slate-900 dark:text-white"}`}>
                              {n.body}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
                          </div>
                          {!n.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500"/> : null}
                        </button>
                      </li>)))}
                </ul>
              </div>) : null}
          </div>

          <Link href="/messages" className="relative hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 sm:inline-flex" aria-label="Messages">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
              2
            </span>
          </Link>

          <div className="relative" ref={menuRef}>
            <button type="button" className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 sm:pr-3" onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
        }} aria-expanded={open}>
              <UserAvatar user={user} size={36}/>
              <span className="hidden max-w-[140px] truncate text-left text-sm font-medium text-slate-800 dark:text-slate-100 sm:block">
                {displayName(user)}
              </span>
              <svg className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {open ? (<div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200/90 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="flex gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <UserAvatar user={user} size={44}/>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{displayName(user)}</p>
                    {user.email ? <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p> : null}
                    <Link href="/profile" className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => setOpen(false)}>
                      View profile
                    </Link>
                  </div>
                </div>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                  <span className="text-indigo-500">⚙</span> Settings
                </Link>
                <a href="https://support.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                  <span className="text-indigo-500">?</span> Help &amp; support
                </a>
                <button type="button" className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30" onClick={() => void logout()} disabled={loggingOut}>
                  {loggingOut ? "Signing out…" : "Log out"}
                </button>
              </div>) : null}
          </div>

          <button type="button" className="inline-flex rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:hidden" aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>)}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (<div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:hidden">
          <input type="search" disabled placeholder="Search (soon)" className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"/>
          <Link href="/feed" className="block rounded-xl py-2 text-sm font-medium text-indigo-600" onClick={() => setMobileOpen(false)}>
            Feed home
          </Link>
          <Link href="/find-friends" className="block rounded-xl py-2 text-sm font-medium text-slate-800 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            Find friends
          </Link>
          <Link href="/messages" className="block rounded-xl py-2 text-sm font-medium text-slate-800 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            Messages
          </Link>
          <Link href="/profile" className="block rounded-xl py-2 text-sm font-medium text-slate-800 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            Your profile
          </Link>
          <Link href="/settings" className="block rounded-xl py-2 text-sm font-medium text-slate-800 dark:text-slate-200" onClick={() => setMobileOpen(false)}>
            Account settings
          </Link>
        </div>) : null}
    </header>);
}
