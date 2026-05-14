"use client";
import Link from "next/link";
export function MessagesClient() {
    return (<div className="mx-auto max-w-lg px-4 py-8 text-center sm:px-6">
      <Link href="/feed" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
        ← Back to feed
      </Link>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl dark:bg-indigo-950">
          💬
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Direct messaging is not wired up yet. The chat icon in the header matches the Buddy Script template — this screen reserves the route for when real-time chat ships.
        </p>
      </div>
    </div>);
}
