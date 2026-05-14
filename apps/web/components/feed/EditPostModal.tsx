"use client";
import { useEffect, useRef, useState } from "react";
import { resolvePostImageSrc } from "@/lib/post-image-url";
import type { FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { UserAvatar } from "../ui/UserAvatar";
const MAX_BODY = 8000;
type Props = {
    open: boolean;
    onClose: () => void;
    post: FeedPost;
    currentUser: PublicUser;
    onSaved: (post: FeedPost) => void;
};
export function EditPostModal({ open, onClose, post, currentUser, onSaved }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [body, setBody] = useState(post.body);
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(post.visibility);
    const [stripImage, setStripImage] = useState(false);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!newFile) {
            setObjectUrl(null);
            return;
        }
        const u = URL.createObjectURL(newFile);
        setObjectUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [newFile]);
    useEffect(() => {
        if (!open)
            return;
        setBody(post.body);
        setVisibility(post.visibility);
        setStripImage(false);
        setNewFile(null);
        setErr(null);
        if (fileRef.current)
            fileRef.current.value = "";
    }, [open, post.id, post.body, post.visibility, post.imageUrl]);
    useEffect(() => {
        if (!open)
            return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape")
                onClose();
        }
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);
    async function save() {
        setErr(null);
        const trimmed = body.trim();
        if (!trimmed) {
            setErr("Write something first.");
            return;
        }
        if (trimmed.length > MAX_BODY) {
            setErr(`Max ${MAX_BODY} characters.`);
            return;
        }
        setSaving(true);
        try {
            let res: Response;
            if (newFile) {
                const fd = new FormData();
                fd.set("body", trimmed);
                fd.set("visibility", visibility);
                fd.set("removeImage", "false");
                fd.set("image", newFile);
                res = await fetch(`/api/posts/${post.id}`, { method: "PATCH", body: fd, credentials: "include" });
            }
            else {
                res = await fetch(`/api/posts/${post.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        body: trimmed,
                        visibility,
                        removeImage: stripImage && !!post.imageUrl,
                    }),
                });
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErr(typeof data.error === "string" ? data.error : "Could not save");
                return;
            }
            onSaved(data.post as FeedPost);
            onClose();
        }
        finally {
            setSaving(false);
        }
    }
    if (!open)
        return null;
    const displayImg = objectUrl || (!stripImage && post.imageUrl ? (resolvePostImageSrc(post.imageUrl) ?? post.imageUrl) : null);
    return (<div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 pt-10 backdrop-blur-sm sm:pt-16" role="presentation" onMouseDown={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }}>
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#242526]" role="dialog" aria-modal="true" aria-labelledby="edit-post-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 id="edit-post-title" className="text-lg font-bold text-slate-900 dark:text-[#e4e6eb]">
            Edit post
          </h2>
          <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-[#b0b3b8] dark:hover:bg-slate-700" aria-label="Close" onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700/80">
          <div className="flex gap-3">
            <UserAvatar user={currentUser} size={40} className="ring-2 ring-white dark:ring-slate-800"/>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-[#e4e6eb]">{displayName(currentUser)}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
                <svg className="h-3.5 w-3.5 opacity-70" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <label className="sr-only" htmlFor="edit-visibility">
                  Audience
                </label>
                <select id="edit-visibility" className="cursor-pointer bg-transparent font-semibold outline-none dark:text-[#e4e6eb]" value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Only me</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <textarea className="min-h-[140px] w-full resize-y bg-transparent text-[15px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#e4e6eb] dark:placeholder:text-[#8a8d91]" placeholder="What's on your mind?" value={body} maxLength={MAX_BODY} onChange={(e) => setBody(e.target.value)}/>
          <div className="mt-1 text-right text-xs text-slate-400 dark:text-[#8a8d91]">
            {body.length.toLocaleString()} / {MAX_BODY.toLocaleString()}
          </div>

          {displayImg ? (<div className="relative mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600">
              <img src={displayImg} alt="" className="max-h-64 w-full object-cover"/>
              <button type="button" className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900" aria-label="Remove photo" onClick={() => {
                if (newFile) {
                    setNewFile(null);
                    if (fileRef.current)
                        fileRef.current.value = "";
                }
                else {
                    setStripImage(true);
                }
            }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>) : null}

          <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-[#b0b3b8] dark:hover:bg-[#3a3b3c]" onClick={() => fileRef.current?.click()}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {displayImg ? "Replace photo" : "Add to your post"}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
                setNewFile(f);
                setStripImage(false);
            }
        }}/>
        </div>

        {err ? (<p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {err}
          </p>) : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <button type="button" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c]" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 dark:bg-[#2374e1] dark:hover:bg-[#1877f2]" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>);
}
