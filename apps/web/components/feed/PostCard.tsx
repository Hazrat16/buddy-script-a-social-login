"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommentNode, FeedPost, PublicUser } from "./feed-types";
import { displayName } from "./feed-types";
import { formatRelativeTime, summarizeLikers } from "./format";

const AV = "https://placehold.co/44x44/e8eef5/377dff?text=%E2%80%A2";

async function togglePostLike(postId: string) {
  const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Like failed");
  return data as { likedByMe: boolean; likeCount: number; likedBy: PublicUser[] };
}

async function toggleCommentLike(commentId: string) {
  const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Like failed");
  return data as { likedByMe: boolean; likeCount: number; likedBy: PublicUser[] };
}

function CommentRow({
  c,
  postId,
  depth,
  onThreadChange,
}: {
  c: CommentNode;
  postId: string;
  depth: number;
  onThreadChange: () => Promise<void>;
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
    <div className={depth > 0 ? "ms-4 mt-3 border-start ps-3" : ""}>
      <div className="_comment_main">
        <div className="_comment_image">
          <span className="_comment_image_link">
            <img src={AV} alt="" className="_comment_img1" width={36} height={36} />
          </span>
        </div>
        <div className="_comment_area">
          <div className="_comment_details">
            <div className="_comment_details_top">
              <div className="_comment_name">
                <h4 className="_comment_name_title">{displayName(node.author)}</h4>
              </div>
            </div>
            <div className="_comment_status">
              <p className="_comment_status_text">
                <span>{node.body}</span>
              </p>
            </div>
            {node.likeCount > 0 ? (
              <div className="_total_reactions">
                <div className="_total_react">
                  <span className="_reaction_like">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                  </span>
                </div>
                <span className="_total">{node.likeCount}</span>
              </div>
            ) : null}
            {node.likedBy.length > 0 ? (
              <p className="small text-muted mb-1">{summarizeLikers(node.likedBy, node.likeCount)}</p>
            ) : null}
            <div className="_comment_reply">
              <div className="_comment_reply_num">
                <ul className="_comment_reply_list">
                  <li>
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0"
                      onClick={() => void like()}
                      disabled={busy}
                    >
                      <span>{node.likedByMe ? "Unlike" : "Like"}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0"
                      onClick={() => setReplyOpen((v) => !v)}
                    >
                      <span>Reply</span>
                    </button>
                  </li>
                  <li>
                    <span className="_time_link">{formatRelativeTime(node.createdAt)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {replyOpen ? (
            <div className="_feed_inner_comment_box mt-2">
              <div className="_feed_inner_comment_box_form">
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_image">
                    <img src={AV} alt="" className="_comment_img" width={32} height={32} />
                  </div>
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-2">
                  <button type="button" className="btn btn-sm btn-light" onClick={() => setReplyOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm _feed_inner_text_area_btn_link"
                    onClick={() => void sendReply()}
                    disabled={busy}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {node.replies.map((r) => (
        <CommentRow
          key={r.id}
          c={r}
          postId={postId}
          depth={depth + 1}
          onThreadChange={onThreadChange}
        />
      ))}
    </div>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const [p, setP] = useState(post);
  const [menu, setMenu] = useState(false);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);

  const reloadComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${p.id}/comments`);
    const data = await res.json();
    if (res.ok) setComments(data.comments as CommentNode[]);
  }, [p.id]);

  useEffect(() => {
    void reloadComments();
  }, [reloadComments]);

  useEffect(() => {
    setP(post);
  }, [post]);

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

  const visLabel = p.visibility === "PUBLIC" ? "Public" : "Private";

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src={AV} alt="" className="_post_img" width={44} height={44} />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{displayName(p.author)}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatRelativeTime(p.createdAt)} .<span className="ms-1">{visLabel}</span>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
                aria-expanded={menu}
                onClick={() => setMenu((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            <div className={`_feed_timeline_dropdown _timeline_dropdown${menu ? " show" : ""}`}>
              <ul className="_feed_timeline_dropdown_list">
                <li className="_feed_timeline_dropdown_item">
                  <span className="_feed_timeline_dropdown_link">Post options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">{p.body}</h4>
        {p.imageUrl ? (
          <div className="_feed_inner_timeline_image">
            <img src={p.imageUrl} alt="" className="_time_img" />
          </div>
        ) : null}
      </div>
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {p.likedBy.slice(0, 5).map((u, i) => (
            <img
              key={u.id + i}
              src={`https://placehold.co/28x28/e8eef5/377dff?text=${encodeURIComponent((u.firstName[0] || "?").toUpperCase())}`}
              alt=""
              className={i === 0 ? "_react_img1" : "_react_img"}
              width={28}
              height={28}
            />
          ))}
          {p.likeCount > 5 ? <p className="_feed_inner_timeline_total_reacts_para">+</p> : null}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <span>{p.commentCount}</span> Comment
          </p>
        </div>
      </div>
      {p.likeCount > 0 ? (
        <p className="small text-muted px-4 mb-2">{summarizeLikers(p.likedBy, p.likeCount)}</p>
      ) : null}
      <div className="_feed_inner_timeline_reaction">
        <button
          type="button"
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction${p.likedByMe ? " _feed_reaction_active" : ""}`}
          onClick={() => void likePost()}
          disabled={busy}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path
                  fill="#FFCC4D"
                  d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
                />
                <path
                  fill="#664500"
                  d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                />
                <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                <path
                  fill="#664500"
                  d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                />
              </svg>
              Like
            </span>
          </span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_comment _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path
                  stroke="#000"
                  d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
                />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction" onClick={(e) => e.preventDefault()}>
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <div className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src={AV} alt="" className="_comment_img" width={32} height={32} />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
              <button
                type="button"
                className="_feed_inner_text_area_btn_link btn-sm"
                onClick={() => void sendComment()}
                disabled={busy}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="_timline_comment_main px-3 pb-2">
        {comments.map((c) => (
          <CommentRow key={c.id} c={c} postId={p.id} depth={0} onThreadChange={reloadComments} />
        ))}
      </div>
    </div>
  );
}
