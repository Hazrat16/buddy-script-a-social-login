"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedNav } from "./FeedNav";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import type { FeedPost, PublicUser } from "./feed-types";
import { FeedSkeleton } from "../ui/FeedSkeleton";

const fetchOpts: RequestInit = { credentials: "include" };

export function FeedPageClient() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    let cancelled = false;
    (async () => {
      const u = await fetch("/api/auth/me", fetchOpts);
      const ud = await u.json();
      if (cancelled) return;
      if (!u.ok || !ud.user) {
        router.push("/login");
        return;
      }
      setMe(ud.user);
      setPostsLoading(true);
      const url = new URL("/api/posts", window.location.origin);
      const res = await fetch(url.toString(), fetchOpts);
      const data = await res.json();
      if (!cancelled && res.ok) {
        setPosts(data.posts as FeedPost[]);
        setCursor(data.nextCursor as string | null);
      }
      if (!cancelled) setPostsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (postsLoading || posts.length === 0) return;
    const id = window.location.hash.slice(1);
    if (!id.startsWith("post-")) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [postsLoading, posts]);

  if (!me) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-14 animate-pulse border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80" />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading your feed…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <FeedNav user={me} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Explore</h2>
                <ul className="mt-4 space-y-1">
                  <li>
                    <Link
                      href="/feed"
                      className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Feed home
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-6">
            <PostComposer me={me} onPosted={(newPost) => setPosts((prev) => [newPost, ...prev])} />
            {err ? (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {err}
              </p>
            ) : null}

            {postsLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-900/40">
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your feed is quiet</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Write a post above — public posts show for everyone; private ones stay yours.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} currentUser={me} />
                ))}
              </div>
            )}

            {!postsLoading && cursor ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </main>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/90">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tips</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Private posts are visible only to you. Public posts appear in everyone&apos;s feed.
              </p>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300">Deep links:</strong> open a post&apos;s menu → Copy link, or tap Copy in the bar. Opening that URL scrolls to the post.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
