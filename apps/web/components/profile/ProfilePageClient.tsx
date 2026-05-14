"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost, PublicUser } from "@/components/feed/feed-types";
import { displayName } from "@/components/feed/feed-types";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { UserAvatar } from "@/components/ui/UserAvatar";

const fetchOpts: RequestInit = { credentials: "include" };

function formatMemberSince(iso?: string) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function ProfilePageClient() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [postsErr, setPostsErr] = useState<string | null>(null);

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
      const user = ud.user as PublicUser;
      setMe(user);

      setPostsLoading(true);
      setPostsErr(null);
      const pr = await fetch("/api/posts/me", fetchOpts);
      const pd = await pr.json();
      if (cancelled) return;
      if (pr.ok) {
        setMyPosts((pd.posts as FeedPost[]) ?? []);
        setPostsCursor((pd.nextCursor as string | null) ?? null);
      } else {
        setPostsErr(typeof pd.error === "string" ? pd.error : "Could not load your posts");
      }
      setPostsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadMorePosts() {
    if (!postsCursor) return;
    setPostsLoadingMore(true);
    setPostsErr(null);
    try {
      const url = new URL("/api/posts/me", window.location.origin);
      url.searchParams.set("cursor", postsCursor);
      const res = await fetch(url.toString(), fetchOpts);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setPostsErr(typeof data.error === "string" ? data.error : "Failed to load posts");
        return;
      }
      setMyPosts((prev) => [...prev, ...(data.posts as FeedPost[])]);
      setPostsCursor((data.nextCursor as string | null) ?? null);
    } finally {
      setPostsLoadingMore(false);
    }
  }

  if (!me) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-14 animate-pulse border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const memberSince = formatMemberSince(me.createdAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 dark:shadow-card-dark">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 sm:h-40" />
          <div className="relative px-5 pb-8 pt-0 sm:px-8">
            <div className="relative -mt-12 flex flex-col items-start sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
              <UserAvatar user={me} size={96} shape="rounded-full" className="ring-4 ring-white shadow-lg dark:ring-slate-900" />
              <div className="mt-4 text-left sm:mb-2 sm:mt-0 sm:flex-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName(me)}</h1>
                {me.email ? <p className="mt-1 text-slate-600 dark:text-slate-400">{me.email}</p> : null}
                <div className="mt-3 flex flex-wrap justify-start gap-2">
                  {typeof me.postCount === "number" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {me.postCount} {me.postCount === 1 ? "post" : "posts"}
                    </span>
                  ) : null}
                  {typeof me.commentCount === "number" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {me.commentCount} {me.commentCount === 1 ? "comment" : "comments"}
                    </span>
                  ) : null}
                  {memberSince ? (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200">
                      Member since {memberSince}
                    </span>
                  ) : null}
                </div>
                <Link
                  href="/settings"
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
                >
                  Account settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8" aria-labelledby="profile-posts-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <h2 id="profile-posts-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                Posts
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Everything you have shared, newest first.</p>
            </div>
            <Link
              href="/feed"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Write a post
            </Link>
          </div>

          {postsErr ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {postsErr}
            </p>
          ) : null}

          {postsLoading ? (
            <FeedSkeleton />
          ) : myPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-900/40">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">No posts yet</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Share an update from your feed — it will show up here on your profile.</p>
              <Link
                href="/feed"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Go to feed
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {myPosts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  currentUser={me}
                  onPostUpdated={(next) => {
                    setMyPosts((prev) => prev.map((x) => (x.id === next.id ? next : x)));
                  }}
                />
              ))}
            </div>
          )}

          {!postsLoading && postsCursor ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                disabled={postsLoadingMore}
                onClick={() => void loadMorePosts()}
              >
                {postsLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Back to feed
          </Link>
        </div>
      </div>
  );
}
