"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import type { FeedPost, PublicUser } from "./feed-types";
import { FeedSkeleton } from "../ui/FeedSkeleton";
import { getHiddenPostIds } from "@/lib/feed-local";
import { useBuddyUser } from "@/components/layout/AuthenticatedBuddyLayout";
import { BuddyFeedShell } from "./buddy/BuddyFeedShell";
import { BuddyStoriesStrip } from "./buddy/BuddyStoriesStrip";

const fetchOpts: RequestInit = { credentials: "include" };

export function FeedPageClient() {
  const router = useRouter();
  const me = useBuddyUser();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<PublicUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hiddenTick, setHiddenTick] = useState(0);

  const visiblePosts = useMemo(() => {
    const hidden = getHiddenPostIds();
    return posts.filter((p) => !hidden.has(p.id));
  }, [posts, hiddenTick]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    setErr(null);
    try {
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString(), fetchOpts);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Failed to load feed");
        return;
      }
      setPosts((prev) => [...prev, ...(data.posts as FeedPost[])]);
      setCursor(data.nextCursor as string | null);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    (async () => {
      setPostsLoading(true);
      const url = new URL("/api/posts", window.location.origin);
      const res = await fetch(url.toString(), fetchOpts);
      const data = await res.json();
      if (cancelled) return;
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        setPosts(data.posts as FeedPost[]);
        setCursor(data.nextCursor as string | null);
      }
      setPostsLoading(false);

      const du = await fetch("/api/users?limit=24", fetchOpts);
      const dud = await du.json();
      if (!cancelled && du.ok && Array.isArray(dud.users)) {
        setDirectoryUsers(dud.users as PublicUser[]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me, router]);

  useEffect(() => {
    if (postsLoading || posts.length === 0) return;
    const id = window.location.hash.slice(1);
    if (!id.startsWith("post-")) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [postsLoading, posts]);

  if (!me) {
    return null;
  }

  return (
    <BuddyFeedShell directoryUsers={directoryUsers}>
      <BuddyStoriesStrip me={me} />
      <PostComposer me={me} buddySkin onPosted={(newPost) => setPosts((prev) => [newPost, ...prev])} />
      {err ? (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _padd_r24 _padd_l24">
          <p className="_notification_para" style={{ color: "#c00" }}>
            {err}
          </p>
        </div>
      ) : null}

      {postsLoading ? (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _padd_r24 _padd_l24">
          <FeedSkeleton />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _padd_r24 _padd_l24">
          <h4 className="_feed_inner_timeline_post_box_title">Your feed is quiet</h4>
          <p className="_notification_para" style={{ marginTop: 8 }}>
            Write a post above — public posts show for everyone; private ones stay yours.
          </p>
        </div>
      ) : (
        <>
          {visiblePosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUser={me}
              buddySkin
              onPostUpdated={(next) => setPosts((prev) => prev.map((x) => (x.id === next.id ? next : x)))}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))}
              onPostHidden={() => setHiddenTick((t) => t + 1)}
            />
          ))}
        </>
      )}

      {!postsLoading && cursor ? (
        <div className="_mar_b16" style={{ textAlign: "center" }}>
          <button type="button" className="_feed_inner_text_area_btn_link" disabled={loadingMore} onClick={() => void loadMore()}>
            <span>{loadingMore ? "Loading…" : "Load more"}</span>
          </button>
        </div>
      ) : null}
    </BuddyFeedShell>
  );
}
