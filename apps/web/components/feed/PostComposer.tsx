"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useComingSoon } from "@/components/ui/ComingSoonProvider";
import type { FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";
const DRAFT_KEY = "buddy:composer-draft";
const MAX_BODY = 8000;
const photoSvg = (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
    <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/>
  </svg>);
export function PostComposer({ me, onPosted, buddySkin = false, }: {
    me: PublicUser;
    onPosted: (p: FeedPost) => void;
    buddySkin?: boolean;
}) {
    const [body, setBody] = useState("");
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
    const [file, setFile] = useState<File | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { showComingSoon } = useComingSoon();
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw)
                return;
            const d = JSON.parse(raw) as {
                body?: unknown;
                visibility?: unknown;
            };
            if (typeof d.body === "string" && d.body.length > 0)
                setBody(d.body);
            if (d.visibility === "PUBLIC" || d.visibility === "PRIVATE")
                setVisibility(d.visibility);
            setDraftRestored(true);
        }
        catch {
        }
    }, []);
    useEffect(() => {
        const t = window.setTimeout(() => {
            try {
                if (!body.trim() && !file) {
                    localStorage.removeItem(DRAFT_KEY);
                    return;
                }
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ body, visibility: "PUBLIC" }));
            }
            catch {
            }
        }, 450);
        return () => window.clearTimeout(t);
    }, [body, file, visibility]);
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
            fd.set("visibility", "PUBLIC");
            if (file)
                fd.set("image", file);
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
            }
            catch {
            }
            if (inputRef.current)
                inputRef.current.value = "";
        }
        finally {
            setLoading(false);
        }
    }, [body, file, onPosted]);
    const len = body.length;
    const nearLimit = len > MAX_BODY - 200;
    const buddyMediaRow = (<div className="_feed_inner_text_area_item" style={{ flexWrap: "nowrap", gap: 16, width: "auto", margin: 0, justifyContent: "flex-start", flex: "0 1 auto", alignItems: "center" }}>
      <div className="_feed_inner_text_area_bottom_photo _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link" style={{ whiteSpace: "nowrap", color: "#5f6b7a", fontSize: 16, lineHeight: "24px", fontWeight: 500 }} onClick={() => inputRef.current?.click()}>
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#5f6b7a" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </span>
          Photo
        </button>
      </div>
      <div className="_feed_inner_text_area_bottom_video _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link" style={{ whiteSpace: "nowrap", color: "#5f6b7a", fontSize: 16, lineHeight: "24px", fontWeight: 500 }} title="Video posts are coming soon" onClick={() => showComingSoon("Video posts")}>
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#5f6b7a" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </span>
          Video
        </button>
      </div>
      <div className="_feed_inner_text_area_bottom_event _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link" style={{ whiteSpace: "nowrap", color: "#5f6b7a", fontSize: 16, lineHeight: "24px", fontWeight: 500 }} title="Events are coming soon" onClick={() => showComingSoon("Events")}>
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#5f6b7a" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </span>
          Event
        </button>
      </div>
      <div className="_feed_inner_text_area_bottom_article _feed_common">
        <button type="button" className="_feed_inner_text_area_bottom_photo_link" style={{ whiteSpace: "nowrap", color: "#5f6b7a", fontSize: 16, lineHeight: "24px", fontWeight: 500 }} title="Articles are coming soon" onClick={() => showComingSoon("Articles")}>
          <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#5f6b7a" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </span>
          Article
        </button>
      </div>
    </div>);
    const buddyPostBtn = (<div className="_feed_inner_text_area_btn" style={{ width: "auto", flex: "0 0 auto", marginLeft: "auto", alignSelf: "center" }}>
      <button type="button" className="_feed_inner_text_area_btn_link" style={{ width: 102, height: 52, borderRadius: 8, padding: "0 18px", display: "inline-flex", alignItems: "center", justifyContent: "center" }} disabled={loading} onClick={() => void submit()}>
        <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
          <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd"/>
        </svg>
        <span>{loading ? "Posting…" : "Post"}</span>
      </button>
    </div>);
    if (buddySkin) {
        return (<div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
        {draftRestored && body.trim() ? (<p className="_notification_para" style={{ marginBottom: 12 }}>
            Restored a saved draft from this browser.
          </p>) : null}
        <div className="_feed_inner_text_area_box" style={{ alignItems: "flex-start" }}>
          <div className="_feed_inner_text_area_box_image" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
            <UserAvatar user={me} size={48} shape="rounded-full"/>
          </div>
          <div className="_feed_inner_text_area_box_form" style={{ width: "100%" }}>
            <textarea className="form-control _textarea" placeholder="Write something ..." id="buddy-composer-textarea" value={body} maxLength={MAX_BODY} style={{ minHeight: 72, paddingTop: 10 }} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void submit();
                }
            }}/>
          </div>
        </div>
        <div className="_feed_inner_text_area_bottom" style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                alignItems: "center",
                justifyContent: "normal",
                gap: 14,
                overflow: "hidden",
                background: "#e9eff6",
                padding: "6px 12px",
                borderRadius: 6,
                borderTop: "none",
                minHeight: 64,
            }}>
          {buddyMediaRow}
          {buddyPostBtn}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)}/>
        {file ? (<p className="_notification_para" style={{ marginTop: 8 }}>
            Attached: {file.name}{" "}
            <button type="button" className="_left_iner_event_bottom_link" onClick={() => setFile(null)}>
              Remove
            </button>
          </p>) : null}
        {err ? (<p className="_notification_para" style={{ marginTop: 8, color: "#c00" }}>
            {err}
          </p>) : null}
        {nearLimit ? (<p className="_nitification_time _buddy_composer_footer" style={{ marginTop: 8, color: "#b45309", fontWeight: 600 }}>
            Near character limit
          </p>) : null}
      </div>);
    }
    return (<div className="mb-6 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
      {draftRestored && body.trim() ? (<p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Restored a saved draft from this browser.
        </p>) : null}
      <div className="flex gap-3">
        <div className="mt-1 shrink-0">
          <UserAvatar user={me} size={40}/>
        </div>
        <div className="min-w-0 flex-1">
          <textarea className="min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-400" placeholder="What's on your mind?" value={body} maxLength={MAX_BODY} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void submit();
            }
        }}/>
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600" onClick={() => inputRef.current?.click()}>
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Photo
          </button>
          <button type="button" title="Video posts are coming soon" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500" onClick={() => showComingSoon("Video posts")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Video
          </button>
          <button type="button" title="Events are coming soon" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500" onClick={() => showComingSoon("Events")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Event
          </button>
          <button type="button" title="Articles are coming soon" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500" onClick={() => showComingSoon("Articles")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Article
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)}/>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="whitespace-nowrap font-medium">Audience</span>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Only me</option>
            </select>
          </label>
        </div>
        <button type="button" onClick={() => void submit()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          {loading ? "Posting…" : "Post"}
        </button>
      </div>

      {file ? (<p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Attached: <span className="font-medium text-slate-700 dark:text-slate-300">{file.name}</span>{" "}
          <button type="button" className="ml-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => setFile(null)}>
            Remove
          </button>
        </p>) : null}
      {err ? <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{err}</p> : null}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">Posting as {displayName(me)}</p>
    </div>);
}
