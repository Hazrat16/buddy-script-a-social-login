import Link from "next/link";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";

export function ProfileMiniCard({ user }: { user: PublicUser }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/95 sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your profile</p>
      <div className="mt-3 flex gap-3">
        <UserAvatar user={user} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900 dark:text-white">{displayName(user)}</p>
          {user.email ? (
            <p className="truncate text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
          ) : null}
          <Link
            href="/profile"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View profile
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
