"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommentNode, FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { formatRelativeTime, isPostEdited, summarizeLikers } from "./format";
import { UserAvatar } from "../ui/UserAvatar";
import { EditPostModal } from "./EditPostModal";
import {
  getMyReactionForPost,
  getShareCounts,
  incrementShareCount,
  isPostSaved,
  setMyPostReaction,
  setPostHidden,
  setPostNotify,
  setPostSaved,
  getNotifyPostIds,
  reactionMeta,
  type UiReaction,
} from "@/lib/feed-local";

const apiFetch: RequestInit = { credentials: "include" };

const REACTION_ORDER: UiReaction[] = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];

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

  async function copyCommentContext() {
    const url = `${window.location.origin}/feed#post-${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* */
    }
  }

  return (
    <div
      id={`comment-${node.id}`}
      className={depth > 0 ? "ms-0 border-l-2 border-indigo-100 pl-4 dark:border-indigo-900/50 sm:ms-2" : ""}
    >
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
            <button
              type="button"
              className="font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              onClick={() => void copyCommentContext()}
            >
              Share
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
  onPostDeleted,
  onPostHidden,
  buddySkin = false,
}: {
  post: FeedPost;
  currentUser: PublicUser;
  onPostUpdated?: (p: FeedPost) => void;
  onPostDeleted?: (id: string) => void;
  onPostHidden?: () => void;
  buddySkin?: boolean;
}) {
  const [p, setP] = useState(post);
  const [menu, setMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [flash, setFlash] = useState<"copy" | "copy-fail" | "saved" | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [shareCount, setShareCount] = useState(() => getShareCounts()[post.id] ?? 0);
  const [savedLocal, setSavedLocal] = useState(() => isPostSaved(post.id));
  const [notifyLocal, setNotifyLocal] = useState(() => getNotifyPostIds().has(post.id));
  const [showAllComments, setShowAllComments] = useState(false);

  const [myUiReaction, setMyUiReaction] = useState<UiReaction | null>(() => getMyReactionForPost(post.id));
  const [picker, setPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

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
    setMyUiReaction(getMyReactionForPost(post.id));
    setShareCount(getShareCounts()[post.id] ?? 0);
    setSavedLocal(isPostSaved(post.id));
    setNotifyLocal(getNotifyPostIds().has(post.id));
  }, [post]);

  useEffect(() => {
    if (!menu && !picker) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t)) setMenu(false);
      if (!pickerRef.current?.contains(t)) setPicker(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [menu, picker]);

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
      if (!r.likedByMe) {
        setMyPostReaction(p.id, null);
        setMyUiReaction(null);
      }
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

  async function sharePost() {
    const url = `${window.location.origin}/feed#post-${p.id}`;
    const n = incrementShareCount(p.id);
    setShareCount(n);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Buddy post", text: p.body.slice(0, 140), url });
      } else {
        await navigator.clipboard.writeText(url);
        setFlash("copy");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setFlash("copy");
      } catch {
        setFlash("copy-fail");
      }
    }
    window.setTimeout(() => setFlash(null), 2200);
  }

  async function deletePost() {
    if (!confirm("Delete this post permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${p.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) return;
      setMenu(false);
      onPostDeleted?.(p.id);
    } finally {
      setBusy(false);
    }
  }

  const visLabel = p.visibility === "PUBLIC" ? "Public" : "Private";
  const visStyles =
    p.visibility === "PUBLIC"
      ? "text-emerald-600 hover:underline dark:text-emerald-400"
      : "text-amber-700 hover:underline dark:text-amber-300";

  const isAuthor = p.author.id === currentUser.id;
  const saved = savedLocal;

  const displayReaction: UiReaction | null = myUiReaction ?? (p.likedByMe ? "LIKE" : null);

  async function pickReaction(r: UiReaction) {
    setMyPostReaction(p.id, r);
    setMyUiReaction(r);
    setPicker(false);
    if (r === "LIKE" && !p.likedByMe) await likePost();
    else if (r !== "LIKE" && !p.likedByMe) await likePost();
  }

  const commentLimit = 2;
  const hasMoreComments = comments.length > commentLimit;
  const shownComments = showAllComments || !hasMoreComments ? comments : comments.slice(0, commentLimit);

  if (buddySkin) {
    const timelineDropId = `_timeline_drop_${p.id}`;
    return (
      <article id={`post-${p.id}`} className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 scroll-mt-24">
        {flash === "copy" ? (
          <div className="_notification_para" style={{ padding: "8px 16px", textAlign: "center", borderBottom: "1px solid #e0f2e9" }}>
            Link copied — share it anywhere.
          </div>
        ) : null}
        {flash === "copy-fail" ? (
          <div className="_notification_para" style={{ padding: "8px 16px", textAlign: "center", borderBottom: "1px solid #fde68a" }}>
            Could not copy — try again or copy the URL from the address bar.
          </div>
        ) : null}
        {flash === "saved" ? (
          <div className="_notification_para" style={{ padding: "8px 16px", textAlign: "center", borderBottom: "1px solid #e0e7ff" }}>
            Saved to your bookmarks list.
          </div>
        ) : null}

        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <div className="_feed_inner_timeline_post_top">
            <div className="_feed_inner_timeline_post_box">
              <div className="_feed_inner_timeline_post_box_image">
                <div style={{ width: 48, height: 48, margin: "0 auto" }}>
                  <UserAvatar user={p.author} size={48} shape="rounded-full" />
                </div>
              </div>
              <div className="_feed_inner_timeline_post_box_txt">
                <h4 className="_feed_inner_timeline_post_box_title">{displayName(p.author)}</h4>
                <p className="_feed_inner_timeline_post_box_para">
                  {formatRelativeTime(p.createdAt)} .{" "}
                  <span>{p.visibility === "PUBLIC" ? "Public" : "Private"}</span>
                  {isPostEdited(p.createdAt, p.updatedAt) ? <> · Edited</> : null}
                </p>
              </div>
            </div>
            <div className="_feed_inner_timeline_post_box_dropdown" ref={menuRef}>
              <div className="_feed_timeline_post_dropdown">
                <button
                  type="button"
                  id={`_timeline_show_drop_btn_${p.id}`}
                  className="_feed_timeline_post_dropdown_link"
                  aria-expanded={menu}
                  aria-controls={timelineDropId}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu((v) => !v);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                  </svg>
                </button>
              </div>
              <div id={timelineDropId} className={`_feed_timeline_dropdown _timeline_dropdown${menu ? " show" : ""}`}>
                <ul className="_feed_timeline_dropdown_list">
                  <li className="_feed_timeline_dropdown_item">
                    <button
                      type="button"
                      className="_feed_timeline_dropdown_link"
                      onClick={() => {
                        const next = !savedLocal;
                        setPostSaved(p.id, next);
                        setSavedLocal(next);
                        setMenu(false);
                        if (next) {
                          setFlash("saved");
                          window.setTimeout(() => setFlash(null), 2000);
                        }
                      }}
                    >
                      {saved ? "Unsave post" : "Save Post"}
                    </button>
                  </li>
                  {!isAuthor ? (
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        type="button"
                        className="_feed_timeline_dropdown_link"
                        onClick={() => {
                          const next = !notifyLocal;
                          setPostNotify(p.id, next);
                          setNotifyLocal(next);
                          setMenu(false);
                        }}
                      >
                        {notifyLocal ? "Turn off notifications" : "Turn On Notification"}
                      </button>
                    </li>
                  ) : null}
                  {!isAuthor ? (
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        type="button"
                        className="_feed_timeline_dropdown_link"
                        onClick={() => {
                          setPostHidden(p.id, true);
                          setMenu(false);
                          onPostHidden?.();
                        }}
                      >
                        Hide
                      </button>
                    </li>
                  ) : null}
                  <li className="_feed_timeline_dropdown_item">
                    <button type="button" className="_feed_timeline_dropdown_link" onClick={() => void copyPostLink()}>
                      Copy link
                    </button>
                  </li>
                  {isAuthor ? (
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        type="button"
                        className="_feed_timeline_dropdown_link"
                        onClick={() => {
                          setEditOpen(true);
                          setMenu(false);
                        }}
                      >
                        Edit post
                      </button>
                    </li>
                  ) : null}
                  {isAuthor ? (
                    <li className="_feed_timeline_dropdown_item">
                      <button type="button" className="_feed_timeline_dropdown_link" onClick={() => void deletePost()} disabled={busy}>
                        Delete Post
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>

          <h4 className="_feed_inner_timeline_post_title" style={{ whiteSpace: "pre-wrap", fontWeight: 400 }}>
            {p.body}
          </h4>
          {p.imageUrl ? (
            <div className="_feed_inner_timeline_image">
              <img src={p.imageUrl} alt="" className="_time_img" />
            </div>
          ) : null}
        </div>

        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          <div className="_feed_inner_timeline_total_reacts_image">
            {p.likedBy.slice(0, 5).map((u, i) => (
              <span key={`${u.id}-${i}`} className="_react_img" style={{ display: "inline-block", width: 28, height: 28, verticalAlign: "middle" }}>
                <UserAvatar user={u} size={28} shape="rounded-full" />
              </span>
            ))}
            {p.likeCount > 5 ? <p className="_feed_inner_timeline_total_reacts_para">{p.likeCount - 5}+</p> : null}
          </div>
          <div className="_feed_inner_timeline_total_reacts_txt">
            <p className="_feed_inner_timeline_total_reacts_para1">
              <button type="button" className="_feed_timeline_dropdown_link" style={{ border: "none", background: "none", padding: 0 }}>
                <span>{p.commentCount}</span> Comment
              </button>
            </p>
            <p className="_feed_inner_timeline_total_reacts_para2">
              <span>{shareCount}</span> Share
            </p>
          </div>
        </div>

        <div className="_feed_inner_timeline_reaction">
          <div className="_buddy_timeline_reaction_primary" ref={pickerRef}>
            <button
              type="button"
              className={`_feed_inner_timeline_reaction_emoji _feed_reaction${displayReaction ? " _feed_reaction_active" : ""}`}
              onClick={() => void likePost()}
              disabled={busy}
            >
              <span className="_feed_inner_timeline_reaction_link">
                <span>
                  {displayReaction ? reactionMeta(displayReaction).emoji : "👍"}{" "}
                  {displayReaction ? reactionMeta(displayReaction).label : "Like"}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="_buddy_reaction_picker_toggle _feed_reaction"
              aria-label="Choose reaction"
              onClick={(e) => {
                e.stopPropagation();
                setPicker((v) => !v);
              }}
            >
              <span aria-hidden>▾</span>
            </button>
            {picker ? (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 50,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 6,
                  minWidth: 220,
                }}
              >
                <div className="_feed_inner_area _b_radious6" style={{ display: "flex", gap: 4, padding: "6px 10px", boxShadow: "0 4px 12px rgba(0,0,0,.12)" }}>
                  {REACTION_ORDER.map((r) => (
                    <button key={r} type="button" className="_feed_reaction" title={reactionMeta(r).label} onClick={(e) => { e.stopPropagation(); void pickReaction(r); }}>
                      {reactionMeta(r).emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="_feed_inner_timeline_reaction_comment _feed_reaction"
            onClick={() => document.getElementById(`comment-input-${p.id}`)?.focus()}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>Comment</span>
            </span>
          </button>
          <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction" onClick={() => void sharePost()}>
            <span className="_feed_inner_timeline_reaction_link">
              <span>Share</span>
            </span>
          </button>
        </div>

        <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24">
          <div className="_feed_inner_comment_box">
            <form
              className="_feed_inner_comment_box_form"
              onSubmit={(e) => {
                e.preventDefault();
                void sendComment();
              }}
            >
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <div className="_comment_img" style={{ width: 40, height: 40 }}>
                    <UserAvatar user={currentUser} size={40} shape="rounded-full" />
                  </div>
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    id={`comment-input-${p.id}`}
                    className="form-control _comment_textarea"
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
                </div>
              </div>
              <div className="_feed_inner_comment_box_icon">
                <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={busy}>
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {comments.length > 0 ? (
          <div className="_timline_comment_main _padd_r24 _padd_l24">
            {hasMoreComments && !showAllComments ? (
              <div className="_previous_comment">
                <button type="button" className="_previous_comment_txt" onClick={() => setShowAllComments(true)}>
                  View {comments.length - commentLimit} previous comments
                </button>
              </div>
            ) : null}
            {shownComments.map((c) => (
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
      {flash === "saved" ? (
        <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2 text-center text-xs font-semibold text-indigo-900 dark:border-indigo-900/30 dark:bg-indigo-950/40 dark:text-indigo-200">
          Saved to your bookmarks list.
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
                <span aria-hidden>·</span>
                <span className={visStyles}>{visLabel}</span>
                {isPostEdited(p.createdAt, p.updatedAt) ? (
                  <span className="text-slate-400 dark:text-slate-500">· Edited</span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="relative flex shrink-0 items-center gap-1" ref={menuRef}>
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
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => {
                    const next = !savedLocal;
                    setPostSaved(p.id, next);
                    setSavedLocal(next);
                    setMenu(false);
                    if (next) {
                      setFlash("saved");
                      window.setTimeout(() => setFlash(null), 2000);
                    }
                  }}
                >
                  <span>🔖</span> {saved ? "Unsave post" : "Save post"}
                </button>
                {!isAuthor ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      const next = !notifyLocal;
                      setPostNotify(p.id, next);
                      setNotifyLocal(next);
                      setMenu(false);
                    }}
                  >
                    <span>🔔</span> {notifyLocal ? "Turn off notifications" : "Turn on notifications"}
                  </button>
                ) : null}
                {!isAuthor ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => {
                      setPostHidden(p.id, true);
                      setMenu(false);
                      onPostHidden?.();
                    }}
                  >
                    <span>🚫</span> Hide post
                  </button>
                ) : null}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => void copyPostLink()}
                >
                  <span>🔗</span> Copy link
                </button>
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
                {isAuthor ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={() => void deletePost()}
                    disabled={busy}
                  >
                    <span>🗑</span> Delete post
                  </button>
                ) : null}
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
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button type="button" className="hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => document.getElementById(`comment-input-${p.id}`)?.focus()}>
            {p.commentCount} comment{p.commentCount === 1 ? "" : "s"}
          </button>
          <span>
            {shareCount} share{shareCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {p.likeCount > 0 ? (
        <p className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">
          {summarizeLikers(p.likedBy, p.likeCount)}
        </p>
      ) : null}

      <div className="relative flex divide-x divide-slate-100 dark:divide-slate-800" ref={pickerRef}>
        <div className="relative flex flex-1">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition ${
              displayReaction ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80"
            }`}
            onClick={() => void likePost()}
            disabled={busy}
          >
            <span className="text-lg leading-none">{displayReaction ? reactionMeta(displayReaction).emoji : "👍"}</span>
            {displayReaction ? reactionMeta(displayReaction).label : "Like"}
          </button>
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-1.5 py-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Choose reaction"
            onClick={(e) => {
              e.stopPropagation();
              setPicker((v) => !v);
            }}
          >
            ▾
          </button>
          {picker ? (
            <div className="absolute bottom-full left-0 right-0 z-40 mb-1 flex justify-center px-2">
              <div className="flex gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                {REACTION_ORDER.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="rounded-full p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title={reactionMeta(r).label}
                    onClick={(e) => {
                      e.stopPropagation();
                      void pickReaction(r);
                    }}
                  >
                    {reactionMeta(r).emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(`comment-input-${p.id}`)?.focus();
          }}
        >
          💬 Comment
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          onClick={() => void sharePost()}
        >
          ↗ Share
        </button>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30 sm:px-6">
        <div className="flex gap-3">
          <div className="mt-1 shrink-0">
            <UserAvatar user={currentUser} size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              id={`comment-input-${p.id}`}
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
          {hasMoreComments && !showAllComments ? (
            <button
              type="button"
              className="mt-2 w-full rounded-lg py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
              onClick={() => setShowAllComments(true)}
            >
              View {comments.length - commentLimit} previous comments
            </button>
          ) : null}
          {shownComments.map((c) => (
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
