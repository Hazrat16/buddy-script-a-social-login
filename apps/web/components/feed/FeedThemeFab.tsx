"use client";

export function FeedThemeFab() {
  return (
    <button
      type="button"
      className="fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-lg backdrop-blur transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-slate-800 lg:bottom-8"
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
  );
}
