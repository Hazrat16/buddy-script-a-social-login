"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedNav } from "./FeedNav";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import type { FeedPost, PublicUser } from "./feed-types";

export function FeedPageClient() {
  const router = useRouter();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    setErr(null);
    try {
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString());
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
      const u = await fetch("/api/auth/me");
      const ud = await u.json();
      if (cancelled) return;
      if (!u.ok || !ud.user) {
        router.push("/login");
        return;
      }
      setMe(ud.user);
      setLoading(true);
      const url = new URL("/api/posts", window.location.origin);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!cancelled && res.ok) {
        setPosts(data.posts as FeedPost[]);
        setCursor(data.nextCursor as string | null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me || loading) {
    return (
      <div className="_layout _layout_main_wrapper d-flex align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
        <p className="_social_login_content_para">Loading…</p>
      </div>
    );
  }

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          onClick={() => document.querySelector("._layout_main_wrapper")?.classList.toggle("_dark_wrapper")}
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path
                fill="#fff"
                d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"
              />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path
                stroke="#fff"
                strokeLinecap="round"
                d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"
              />
            </svg>
          </div>
        </button>
      </div>
      <div className="_main_layout">
        <FeedNav user={me} />
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5  _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item _explore_item">
                          <Link href="#0" className="_left_inner_area_explore_link">
                            Feed home
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <PostComposer
                      me={me}
                      onPosted={(newPost) => setPosts((prev) => [newPost, ...prev])}
                    />
                    {err ? <p className="text-danger">{err}</p> : null}
                    {posts.map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                    {cursor ? (
                      <div className="text-center _mar_b16">
                        <button
                          type="button"
                          className="_social_login_form_btn_link _btn1"
                          disabled={loadingMore}
                          onClick={() => void loadMore()}
                        >
                          {loadingMore ? "Loading…" : "Load more"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 d-none d-xl-block">
                <div className="_layout_middle_wrap">
                  <div className="_feed_inner_area _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6">
                    <h4 className="_title5 _mar_b16">Tips</h4>
                    <p className="small text-muted mb-0">
                      Private posts are visible only to you. Public posts appear in everyone&apos;s feed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
