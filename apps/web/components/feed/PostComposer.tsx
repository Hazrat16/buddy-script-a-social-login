"use client";

import { useRef, useState } from "react";
import type { FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";

const AVATAR = "https://placehold.co/40x40/e0e7ff/4338ca?text=%E2%80%A2";

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
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit() {
    setErr(null);
    if (!body.trim()) {
      setErr("Write something first.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("body", body.trim());
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
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
      <div className="flex gap-3">
        <img src={AVATAR} alt="" className="mt-1 h-10 w-10 shrink-0 rounded-xl object-cover" width={40} height={40} />
        <div className="min-w-0 flex-1">
          <textarea
            className="min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-400"
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
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
