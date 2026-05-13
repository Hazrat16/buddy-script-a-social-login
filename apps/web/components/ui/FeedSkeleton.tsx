export function FeedSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex gap-3 p-5 sm:p-6">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-[92%] animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-6">
            <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
