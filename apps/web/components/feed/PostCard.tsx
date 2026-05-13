"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommentNode, FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { formatRelativeTime, isPostEdited, summarizeLikers } from "./format";
import { UserAvatar } from "../ui/UserAvatar";
import { EditPostModal } from "./EditPostModal";

const apiFetch: RequestInit = { credentials: "include" };

async function togglePostLike(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "POST", ...apiFetch });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Like failed");
  return data as { likedByMe: boolean; likeCount: number; likedBy: PublicUser[] };
}

async function toggleCommentLike(commentId: string) {
  const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST", ...apiFetch });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Like failed");
  return data as { likedByMe: boolean; likeCount: number; likedBy: PublicUser[] };
}

function CommentRow({
  c,
  postId,
  depth,
  onThreadChange,
  viewer,
}: {
  c: CommentNode;
  postId: string;
  depth: number;
  onThreadChange: () => Promise<void>;
  viewer: PublicUser;
}) {
  const [node, setNode] = useState(c);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNode(c);
  }, [c]);

  async function like() {
    setBusy(true);
    try {
      const r = await toggleCommentLike(node.id);
      setNode((n) => ({
        ...n,
        likedByMe: r.likedByMe,
        likeCount: r.likeCount,
        likedBy: r.likedBy,
      }));
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!replyBody.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: replyBody.trim(), parentId: node.id }),
      });
      if (!res.ok) return;
      setReplyBody("");
      setReplyOpen(false);
      await onThreadChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={depth > 0 ? "ms-0 border-l-2 border-indigo-100 pl-4 dark:border-indigo-900/50 sm:ms-2" : ""}>
      <div className="flex gap-3 pt-3">
        <div className="mt-0.5 shrink-0">
          <UserAvatar user={node.author} size={36} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="font-semibold text-slate-900 dark:text-white">{displayName(node.author)}</span>
            <span className="text-xs text-slate-500 dark:text-slate-500">{formatRelativeTime(node.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{node.body}</p>
          {node.likeCount > 0 ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span>{node.likeCount}</span>
            </div>
          ) : null}
          {node.likedBy.length > 0 ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{summarizeLikers(node.likedBy, node.likeCount)}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              className={`font-medium transition ${node.likedByMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"}`}
              onClick={() => void like()}
              disabled={busy}
            >
              {node.likedByMe ? "Unlike" : "Like"}
            </button>
            <button
              type="button"
              className="font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              onClick={() => setReplyOpen((v) => !v)}
            >
              Reply
            </button>
          </div>

          {replyOpen ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex gap-2">
                <UserAvatar user={viewer} size={32} />
                <textarea
                  className="min-h-[72px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Write a reply"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      void sendReply();
                    }
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                <kbd className="rounded border border-slate-200 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-800">⌘</kbd>+
                <kbd className="rounded border border-slate-200 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-800">Enter</kbd> send
              </p>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800"
                  onClick={() => setReplyOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  onClick={() => void sendReply()}
                  disabled={busy}
                >
                  Reply
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {node.replies.map((r) => (
        <CommentRow key={r.id} c={r} postId={postId} depth={depth + 1} onThreadChange={onThreadChange} viewer={viewer} />
      ))}
    </div>
  );
}

export function PostCard({
  post,
  currentUser,
  onPostUpdated,
}: {
  post: FeedPost;
  currentUser: PublicUser;
  onPostUpdated?: (p: FeedPost) => void;
}) {
  const [p, setP] = useState(post);
  const [menu, setMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [flash, setFlash] = useState<"copy" | "copy-fail" | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const reloadComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${p.id}/comments`, apiFetch);
    const data = await res.json();
    if (res.ok) setComments(data.comments as CommentNode[]);
  }, [p.id]);

  useEffect(() => {
    void reloadComments();
  }, [reloadComments]);

  useEffect(() => {
    setP(post);
  }, [post]);

  useEffect(() => {
    if (!menu) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [menu]);

  async function likePost() {
    setBusy(true);
    try {
      const r = await togglePostLike(p.id);
      setP((prev) => ({
        ...prev,
        likedByMe: r.likedByMe,
        likeCount: r.likeCount,
        likedBy: r.likedBy,
      }));
    } finally {
      setBusy(false);
    }
  }

  async function sendComment() {
    if (!commentBody.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${p.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: commentBody.trim() }),
      });
      if (!res.ok) return;
      setCommentBody("");
      await reloadComments();
      setP((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
    } finally {
      setBusy(false);
    }
  }

  async function copyPostLink() {
    const url = `${window.location.origin}/feed#post-${p.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setFlash("copy");
      setMenu(false);
    } catch {
      setFlash("copy-fail");
    }
    window.setTimeout(() => setFlash(null), 2200);
  }

  const visLabel = p.visibility === "PUBLIC" ? "Public" : "Private";
  const visStyles =
    p.visibility === "PUBLIC"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";

  const isAuthor = p.author.id === currentUser.id;

  return (
    <article
      id={`post-${p.id}`}
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white/95 shadow-soft dark:border-slate-800 dark:bg-slate-900/95"
    >
      {flash === "copy" ? (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-center text-xs font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/40 dark:text-emerald-200">
          Link copied — share it anywhere.
        </div>
      ) : null}
      {flash === "copy-fail" ? (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/40 dark:text-amber-200">
          Could not copy — try again or copy the URL from the address bar.
        </div>
      ) : null}

      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <UserAvatar user={p.author} size={44} />
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 dark:text-white">{displayName(p.author)}</h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{formatRelativeTime(p.createdAt)}</span>
                {isPostEdited(p.createdAt, p.updatedAt) ? (
                  <span className="text-slate-400 dark:text-slate-500">· Edited</span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${visStyles}`}>{visLabel}</span>
              </p>
            </div>
          </div>
          <div className="relative flex shrink-0 items-center gap-1" ref={menuRef}>
            {isAuthor ? (
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                onClick={() => setEditOpen(true)}
              >
                Edit
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-expanded={menu}
              aria-label="More post options"
              onClick={(e) => {
                e.stopPropagation();
                setMenu((v) => !v);
              }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
            {menu ? (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {isAuthor ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      setEditOpen(true);
                      setMenu(false);
                    }}
                  >
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit post
                  </button>
                ) : null}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => void copyPostLink()}
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy link
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">{p.body}</p>
        {p.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <img src={p.imageUrl} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-6">
        <div className="flex -space-x-2">
          {p.likedBy.slice(0, 5).map((u, i) => (
            <div key={`${u.id}-${i}`} className="ring-2 ring-white dark:ring-slate-900">
              <UserAvatar user={u} size={28} shape="rounded-full" />
            </div>
          ))}
          {p.likeCount > 5 ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
              +
            </span>
          ) : null}
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {p.commentCount} comment{p.commentCount === 1 ? "" : "s"}
        </span>
      </div>

      {p.likeCount > 0 ? (
        <p className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">
          {summarizeLikers(p.likedBy, p.likeCount)}
        </p>
      ) : null}

      <div className="flex divide-x divide-slate-100 dark:divide-slate-800">
        <button
          type="button"
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
            p.likedByMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          }`}
          onClick={() => void likePost()}
          disabled={busy}
        >
          <span className="text-lg leading-none">👍</span>
          Like
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(`comment-${p.id}`)?.focus();
          }}
        >
          💬 Comment
        </button>
        <button
          type="button"
          className="hidden flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80 sm:flex"
          onClick={() => void copyPostLink()}
        >
          🔗 Copy
        </button>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30 sm:px-6">
        <div className="flex gap-3">
          <div className="mt-1 shrink-0">
            <UserAvatar user={currentUser} size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              id={`comment-${p.id}`}
              className="min-h-[72px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Write a comment"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void sendComment();
                }
              }}
            />
            <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
              <span className="mr-auto text-[10px] text-slate-400 dark:text-slate-500">
                <kbd className="rounded border border-slate-200 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-800">⌘</kbd>+
                <kbd className="rounded border border-slate-200 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-800">Enter</kbd>
              </span>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                onClick={() => void sendComment()}
                disabled={busy}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {comments.length > 0 ? (
        <div className="border-t border-slate-100 px-5 pb-4 pt-1 dark:border-slate-800 sm:px-6">
          {comments.map((c) => (
            <CommentRow key={c.id} c={c} postId={p.id} depth={0} onThreadChange={reloadComments} viewer={currentUser} />
          ))}
        </div>
      ) : null}
      {editOpen ? (
        <EditPostModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          post={p}
          currentUser={currentUser}
          onSaved={(next) => {
            setP(next);
            onPostUpdated?.(next);
          }}
        />
      ) : null}
    </article>
  );
}
