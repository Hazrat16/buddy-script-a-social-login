"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";

const DRAFT_KEY = "buddy:composer-draft";
const MAX_BODY = 8000;

export function PostComposer({
  me,
  onPosted,
}: {
  me: PublicUser;
  onPosted: (p: FeedPost) => void;
}) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { body?: unknown; visibility?: unknown };
      if (typeof d.body === "string" && d.body.length > 0) setBody(d.body);
      if (d.visibility === "PUBLIC" || d.visibility === "PRIVATE") setVisibility(d.visibility);
      setDraftRestored(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (!body.trim() && !file) {
          localStorage.removeItem(DRAFT_KEY);
          return;
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ body, visibility }));
      } catch {
        /* quota */
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [body, visibility, file]);

  const submit = useCallback(async () => {
    setErr(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setErr("Write something first.");
      return;
    }
    if (trimmed.length > MAX_BODY) {
      setErr(`Post is too long (max ${MAX_BODY} characters).`);
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("body", trimmed);
      fd.set("visibility", visibility);
      if (file) fd.set("image", file);
      const res = await fetch("/api/posts", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not post");
        return;
      }
      onPosted(data.post as FeedPost);
      setBody("");
      setFile(null);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* */
      }
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  }, [body, visibility, file, onPosted]);

  const len = body.length;
  const nearLimit = len > MAX_BODY - 200;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
      {draftRestored && body.trim() ? (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Restored a saved draft from this browser.
        </p>
      ) : null}
      <div className="flex gap-3">
        <div className="mt-1 shrink-0">
          <UserAvatar user={me} size={40} />
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            className="min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-400"
            placeholder="What's on your mind?"
            value={body}
            maxLength={MAX_BODY}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-500">
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">
                ⌘
              </kbd>
              <span className="mx-0.5">+</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-600 dark:bg-slate-800">
                Enter
              </kbd>
              <span className="ml-1 hidden sm:inline">to post</span>
            </span>
            <span className={nearLimit ? "font-semibold text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-500"}>
              {len.toLocaleString()} / {MAX_BODY.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
            onClick={() => inputRef.current?.click()}
          >
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Photo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="whitespace-nowrap font-medium">Audience</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Only me</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {loading ? "Posting…" : "Post"}
        </button>
      </div>

      {file ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Attached: <span className="font-medium text-slate-700 dark:text-slate-300">{file.name}</span>{" "}
          <button type="button" className="ml-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => setFile(null)}>
            Remove
          </button>
        </p>
      ) : null}
      {err ? <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{err}</p> : null}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">Posting as {displayName(me)}</p>
    </div>
  );
}
