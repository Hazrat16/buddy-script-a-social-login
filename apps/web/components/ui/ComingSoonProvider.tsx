"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
type ComingSoonContextValue = {
    showComingSoon: (featureLabel?: string) => void;
};
const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);
export function useComingSoon(): ComingSoonContextValue {
    const ctx = useContext(ComingSoonContext);
    if (!ctx) {
        return { showComingSoon: () => { } };
    }
    return ctx;
}
export function ComingSoonProvider({ children }: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState<string | undefined>(undefined);
    const okRef = useRef<HTMLButtonElement>(null);
    const showComingSoon = useCallback((featureLabel?: string) => {
        setLabel(featureLabel);
        setOpen(true);
    }, []);
    const close = useCallback(() => {
        setOpen(false);
    }, []);
    useEffect(() => {
        if (!open)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = window.setTimeout(() => okRef.current?.focus(), 0);
        return () => {
            document.body.style.overflow = prev;
            window.clearTimeout(t);
        };
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape")
                close();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, close]);
    return (<ComingSoonContext.Provider value={{ showComingSoon }}>
      {children}
      {open ? (<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="presentation">
          <button type="button" className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-[1px]" aria-label="Close dialog" onClick={close}/>
          <div role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" className="relative z-[1] w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-600 dark:bg-slate-900">
            <h2 id="coming-soon-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {label ? `${label}` : "Coming soon"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {label
                ? "This part of Buddy is not ready yet. We will ship it in a future update."
                : "This feature is not available yet. Check back later for updates."}
            </p>
            <button ref={okRef} type="button" onClick={close} className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
              OK
            </button>
          </div>
        </div>) : null}
    </ComingSoonContext.Provider>);
}
