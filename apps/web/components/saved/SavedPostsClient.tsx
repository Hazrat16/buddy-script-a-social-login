"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FeedPost, PublicUser } from "@/components/feed/feed-types";
import { PostCard } from "@/components/feed/PostCard";
import { getSavedPostIds } from "@/lib/feed-local";
const fetchOpts: RequestInit = { credentials: "include" };
export function SavedPostsClient() {
    const router = useRouter();
    const [me, setMe] = useState<PublicUser | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const loadSaved = useCallback(async () => {
        const ids = [...getSavedPostIds()];
        if (ids.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const results = await Promise.all(ids.slice(0, 30).map(async (id) => {
            const res = await fetch(`/api/posts/${id}`, fetchOpts);
            const data = await res.json();
            if (!res.ok)
                return null;
            return data.post as FeedPost;
        }));
        setPosts(results.filter(Boolean) as FeedPost[]);
        setLoading(false);
    }, []);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const u = await fetch("/api/auth/me", fetchOpts);
            const ud = await u.json();
            if (cancelled)
                return;
            if (!u.ok || !ud.user) {
                router.push("/login");
                return;
            }
            setMe(ud.user);
            await loadSaved();
        })();
        return () => {
            cancelled = true;
        };
    }, [router, loadSaved]);
    if (!me) {
        return (<div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"/>
      </div>);
    }
    return (<div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Link href="/feed" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          ← Back to feed
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Saved posts</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Posts you bookmark from the ··· menu on the feed (stored in this browser).</p>

        {loading ? (<p className="mt-10 text-center text-sm text-slate-500">Loading…</p>) : posts.length === 0 ? (<p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
            Nothing saved yet. Open the feed, tap a post&apos;s menu, and choose <strong className="text-slate-800 dark:text-slate-200">Save post</strong>.
          </p>) : (<div className="mt-8 space-y-5">
            {posts.map((p) => (<PostCard key={p.id} post={p} currentUser={me} onPostUpdated={(next) => setPosts((prev) => prev.map((x) => (x.id === next.id ? next : x)))} onPostDeleted={() => void loadSaved()}/>))}
          </div>)}
    </div>);
}
