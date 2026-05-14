"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function NavInner({
  active,
  icon,
  label,
  badge,
  onClick,
  href,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
  href: string;
}) {
  const cls = `relative flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium ${
    active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
  }`;
  const body = (
    <>
      <span className="relative mx-auto inline-flex">
        {icon}
        {badge && badge > 0 ? (
          <span className="absolute -right-2 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span className="mt-0.5">{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {body}
      </button>
    );
  }
  return (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}

export function FeedBottomNav({
  unreadNotifications,
  unreadMessages,
}: {
  unreadNotifications: number;
  unreadMessages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const feed = pathname === "/feed" || pathname.startsWith("/feed");
  const friends = pathname === "/find-friends";
  const messages = pathname === "/messages";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/95 lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        <NavInner
          href="/feed"
          active={feed}
          label="Home"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <NavInner
          href="/find-friends"
          active={friends}
          label="Friends"
          icon={
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          }
        />
        <NavInner
          href="/feed"
          active={false}
          label="Alerts"
          badge={unreadNotifications}
          onClick={() => {
            router.push("/feed");
            queueMicrotask(() => window.dispatchEvent(new Event("buddy:open-notifications")));
          }}
          icon={
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          }
        />
        <NavInner
          href="/messages"
          active={messages}
          label="Chat"
          badge={unreadMessages}
          icon={
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          }
        />
        <Link
          href="/profile"
          className={`flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium ${
            pathname === "/profile" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <svg className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mt-0.5">Menu</span>
        </Link>
      </div>
    </nav>
  );
}
