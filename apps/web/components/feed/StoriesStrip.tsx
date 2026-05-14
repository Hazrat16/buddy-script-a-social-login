"use client";
import Link from "next/link";
import { UserAvatar } from "../ui/UserAvatar";
import type { PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
const demoStories: {
    name: string;
    seen: boolean;
}[] = [
    { name: "Your story", seen: false },
    { name: "Alex Kim", seen: false },
    { name: "Jordan Lee", seen: true },
    { name: "Sam Rivera", seen: true },
];
export function StoriesStrip({ me }: {
    me: PublicUser;
}) {
    return (<div className="mb-6">
      <div className="hidden md:block">
        <div className="relative rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
          <div className="grid grid-cols-4 gap-3">
            <Link href="/feed" className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 ring-2 ring-indigo-200 ring-offset-2 dark:ring-indigo-900 dark:ring-offset-slate-900">
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-black/20 p-2 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/90 text-indigo-600 shadow group-hover:scale-105">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
                  </svg>
                </span>
                <p className="mt-2 text-center text-xs font-bold text-white drop-shadow">Your story</p>
              </div>
              <div className="absolute left-2 top-2 opacity-90 ring-2 ring-white rounded-full">
                <UserAvatar user={me} size={32}/>
              </div>
            </Link>
            {demoStories.slice(1).map((s) => (<button key={s.name} type="button" className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-200 transition hover:opacity-95 dark:bg-slate-800 ${s.seen ? "ring-1 ring-slate-300 dark:ring-slate-600" : "ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900"}`} title={s.name}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                <div className="absolute bottom-2 left-2 right-2 text-left text-xs font-semibold text-white">{s.name}</div>
                <div className="absolute left-2 top-2 rounded-full ring-2 ring-white">
                  <div className="h-8 w-8 rounded-full bg-slate-400"/>
                </div>
              </button>))}
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 md:hidden">
        <Link href="/feed" className="flex w-20 shrink-0 flex-col items-center gap-1">
          <div className="relative">
            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-[3px]">
              <UserAvatar user={me} size={56} shape="rounded-full"/>
            </div>
            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white dark:border-slate-900">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
              </svg>
            </span>
          </div>
          <span className="w-full truncate text-center text-[10px] font-medium text-slate-700 dark:text-slate-300">Your story</span>
        </Link>
        {demoStories.slice(1).map((s) => (<button key={s.name} type="button" className="flex w-16 shrink-0 flex-col items-center gap-1">
            <div className={`rounded-full p-[2px] ${s.seen ? "bg-slate-300 dark:bg-slate-600" : "bg-gradient-to-tr from-amber-400 to-pink-500"}`}>
              <div className="rounded-full bg-white p-[2px] dark:bg-slate-900">
                <div className="h-14 w-14 rounded-full bg-slate-300 dark:bg-slate-700"/>
              </div>
            </div>
            <span className="w-full truncate text-center text-[10px] text-slate-600 dark:text-slate-400">{s.name.split(" ")[0]}…</span>
          </button>))}
      </div>
    </div>);
}
