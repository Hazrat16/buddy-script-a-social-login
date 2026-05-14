"use client";

import Link from "next/link";
import { useComingSoon } from "@/components/ui/ComingSoonProvider";
import type { PublicUser } from "../feed-types";
import { displayName } from "../feed-types";

const PLACEHOLDER = "/assets/images/logo.svg";

export function BuddyStoriesStrip({ me }: { me: PublicUser }) {
  const { showComingSoon } = useComingSoon();
  const label = displayName(me);
  return (
    <>
      <div className="_feed_inner_ppl_card _mar_b16">
        <div className="_feed_inner_story_arrow">
          <button type="button" className="_feed_inner_story_arrow_btn" aria-label="Scroll stories" onClick={() => showComingSoon("Stories")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
              <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
            </svg>
          </button>
        </div>
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
            <div className="_feed_inner_profile_story _b_radious6">
              <div className="_feed_inner_profile_story_image">
                <img src={PLACEHOLDER} alt="" className="_profile_story_img" />
                <div className="_feed_inner_story_txt">
                  <div className="_feed_inner_story_btn">
                    <button type="button" className="_feed_inner_story_btn_link" aria-label="Add to your story" onClick={() => showComingSoon("Stories")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                        <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                      </svg>
                    </button>
                  </div>
                  <p className="_feed_inner_story_para">Your Story</p>
                </div>
              </div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`col-xl-3 col-lg-3 col-md-4 col-sm-4 col${i > 1 ? " _custom_mobile_none" : ""}${i > 2 ? " _custom_none" : ""}`}
            >
              <div
                className="_feed_inner_public_story _b_radious6"
                role="button"
                tabIndex={0}
                onClick={() => showComingSoon("Stories")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    showComingSoon("Stories");
                  }
                }}
              >
                <div className="_feed_inner_public_story_image">
                  <img src={PLACEHOLDER} alt="" className="_public_story_img" />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">
                      {(label.split(" ")[0] ?? "Friend").slice(0, 10)}
                      …
                    </p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img src={PLACEHOLDER} alt="" className="_public_mini_img" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="_feed_inner_ppl_card_mobile _mar_b16">
        <div className="_feed_inner_ppl_card_area">
          <ul className="_feed_inner_ppl_card_area_list">
            <li className="_feed_inner_ppl_card_area_item">
              <Link href="/feed" className="_feed_inner_ppl_card_area_link">
                <div className="_feed_inner_ppl_card_area_story">
                  <img src={PLACEHOLDER} alt="" className="_card_story_img" />
                  <div className="_feed_inner_ppl_btn">
                    <span className="_feed_inner_ppl_btn_link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                        <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                      </svg>
                    </span>
                  </div>
                </div>
                <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
              </Link>
            </li>
            {[1, 2, 3].map((i) => (
              <li key={i} className="_feed_inner_ppl_card_area_item">
                <button
                  type="button"
                  className="_feed_inner_ppl_card_area_link"
                  style={{ border: "none", background: "transparent", padding: 0, width: "100%", cursor: "pointer", font: "inherit", color: "inherit" }}
                  onClick={() => showComingSoon("Stories")}
                >
                  <div className={i === 1 ? "_feed_inner_ppl_card_area_story_active" : "_feed_inner_ppl_card_area_story_inactive"}>
                    <img src={PLACEHOLDER} alt="" className="_card_story_img1" />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">{label.slice(0, 8)}…</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
