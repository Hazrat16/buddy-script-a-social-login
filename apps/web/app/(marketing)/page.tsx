import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
export default async function HomePage() {
    const session = await getSession();
    if (session)
        redirect("/feed");
    return (<div className="relative flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
              B
            </span>
            Buddy
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="rounded-xl px-4 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Log in
            </Link>
            <Link href="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-500">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Social, simplified
        </p>
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          Share moments with people who matter.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg text-slate-600 dark:text-slate-400">
          A focused feed for posts, photos, and conversations — with public or private visibility and reactions that feel
          instant.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500">
            Get started
          </Link>
          <Link href="/register" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-8 py-3.5 text-base font-semibold text-slate-800 backdrop-blur transition hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500">
            Create account
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
        Buddy — built for clarity, not noise.
      </footer>
    </div>);
}
