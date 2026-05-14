"use client";

import Link from "next/link";
import type { PublicUser } from "../feed-types";
import { displayName } from "../feed-types";
import { formatRelativeTime } from "../format";

const PLACEHOLDER_IMG = "/assets/images/logo.svg";

export function BuddyFeedShell({
  directoryUsers,
  children,
}: {
  directoryUsers: PublicUser[];
  children: React.ReactNode;
}) {
  const suggested = directoryUsers.slice(0, 3);
  const rightPeople = directoryUsers.slice(0, 4);
  const memberProfileHref = "/find-friends";

  return (
    <div className="container _custom_container">
  <div className="_layout_inner_wrap">
    <div className="row">
      <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
        <div className="_layout_left_sidebar_wrap">
          <div className="_layout_left_sidebar_inner">
            <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
              <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
              <ul className="_left_inner_area_explore_list">
                <li className="_left_inner_area_explore_item _explore_item">
                  <span className="_left_inner_area_explore_link" style={{ cursor: "default" }}>
                    Learning
                  </span>
                  <span className="_left_inner_area_explore_link_txt">New</span>
                </li>
                <li className="_left_inner_area_explore_item">
                  <span className="_left_inner_area_explore_link" style={{ cursor: "default" }}>
                    Insights
                  </span>
                </li>
                <li className="_left_inner_area_explore_item">
                  <Link href="/find-friends" className="_left_inner_area_explore_link">
                    Find friends
                  </Link>
                </li>
                <li className="_left_inner_area_explore_item">
                  <Link href="/saved" className="_left_inner_area_explore_link">
                    Bookmarks
                  </Link>
                </li>
                <li className="_left_inner_area_explore_item">
                  <span className="_left_inner_area_explore_link" style={{ cursor: "default" }}>
                    Group
                  </span>
                </li>
                <li className="_left_inner_area_explore_item _explore_item">
                  <span className="_left_inner_area_explore_link" style={{ cursor: "default" }}>
                    Gaming
                  </span>
                  <span className="_left_inner_area_explore_link_txt">New</span>
                </li>
                <li className="_left_inner_area_explore_item">
                  <Link href="/settings" className="_left_inner_area_explore_link">
                    Settings
                  </Link>
                </li>
                <li className="_left_inner_area_explore_item">
                  <Link href="/saved" className="_left_inner_area_explore_link">
                    Save post
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="_layout_left_sidebar_inner">
            <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
              <div className="_left_inner_area_suggest_content _mar_b24">
                <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
                <span className="_left_inner_area_suggest_content_txt">
                  <Link className="_left_inner_area_suggest_content_txt_link" href="/find-friends">
                    See All
                  </Link>
                </span>
              </div>
              {suggested.map((u) => (
                <div key={u.id} className="_left_inner_area_suggest_info">
                  <div className="_left_inner_area_suggest_info_box">
                    <div className="_left_inner_area_suggest_info_image">
                      <Link href={memberProfileHref}>
                        <img src={PLACEHOLDER_IMG} alt="" className="_info_img" />
                      </Link>
                    </div>
                    <div className="_left_inner_area_suggest_info_txt">
                      <Link href={memberProfileHref}>
                        <h4 className="_left_inner_area_suggest_info_title">{displayName(u)}</h4>
                      </Link>
                      <p className="_left_inner_area_suggest_info_para">Buddy member</p>
                    </div>
                  </div>
                  <div className="_left_inner_area_suggest_info_link">
                    <Link href="/find-friends" className="_info_link">
                      Connect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="_layout_left_sidebar_inner">
            <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
              <div className="_left_inner_event_content">
                <h4 className="_left_inner_event_title _title5">Events</h4>
                <span className="_left_inner_event_link">See all</span>
              </div>
              <div className="_left_inner_event_card_link" style={{ cursor: "pointer" }}>
                <div className="_left_inner_event_card">
                  <div className="_left_inner_event_card_iamge">
                    <img src={PLACEHOLDER_IMG} alt="" className="_card_img" />
                  </div>
                  <div className="_left_inner_event_card_content">
                    <div className="_left_inner_card_date">
                      <p className="_left_inner_card_date_para">10</p>
                      <p className="_left_inner_card_date_para1">Jul</p>
                    </div>
                    <div className="_left_inner_card_txt">
                      <h4 className="_left_inner_event_card_title">Community meetup</h4>
                    </div>
                  </div>
                  <hr className="_underline" />
                  <div className="_left_inner_event_bottom">
                    <p className="_left_iner_event_bottom">17 People Going</p>
                    <span className="_left_iner_event_bottom_link">Going</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
        <div className="_layout_middle_wrap">
          <div className="_layout_middle_inner">{children}</div>
        </div>
      </div>

      <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
        <div className="_layout_right_sidebar_wrap">
          <div className="_layout_right_sidebar_inner">
            <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
              <div className="_right_inner_area_info_content _mar_b24">
                <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                <span className="_right_inner_area_info_content_txt">
                  <Link className="_right_inner_area_info_content_txt_link" href="/find-friends">
                    See All
                  </Link>
                </span>
              </div>
              <hr className="_underline" />
              {rightPeople[0] ? (
                <div className="_right_inner_area_info_ppl">
                  <div className="_right_inner_area_info_box">
                    <div className="_right_inner_area_info_box_image">
                      <Link href={memberProfileHref}>
                        <img src={PLACEHOLDER_IMG} alt="" className="_ppl_img" />
                      </Link>
                    </div>
                    <div className="_right_inner_area_info_box_txt">
                      <Link href={memberProfileHref}>
                        <h4 className="_right_inner_area_info_box_title">{displayName(rightPeople[0])}</h4>
                      </Link>
                      <p className="_right_inner_area_info_box_para">Buddy member</p>
                    </div>
                  </div>
                  <div className="_right_info_btn_grp">
                    <button type="button" className="_right_info_btn_link">
                      Ignore
                    </button>
                    <button type="button" className="_right_info_btn_link _right_info_btn_link_active">
                      Follow
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="_layout_right_sidebar_inner">
            <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
              <div className="_feed_top_fixed">
                <div className="_feed_right_inner_area_card_content _mar_b24">
                  <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
                  <span className="_feed_right_inner_area_card_content_txt">
                    <Link className="_feed_right_inner_area_card_content_txt_link" href="/find-friends">
                      See All
                    </Link>
                  </span>
                </div>
                <form className="_feed_right_inner_area_card_form" onSubmit={(e) => e.preventDefault()}>
                  <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                    <circle cx="7" cy="7" r="6" stroke="#666" />
                    <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                  </svg>
                  <input
                    className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                    type="search"
                    placeholder="Search friends…"
                    aria-label="Search friends"
                  />
                </form>
              </div>
              <div className="_feed_bottom_fixed">
                {rightPeople.slice(0, 5).map((u) => (
                  <div key={u.id} className="_feed_right_inner_area_card_ppl _feed_right_inner_area_card_ppl_inactive">
                    <div className="_feed_right_inner_area_card_ppl_box">
                      <div className="_feed_right_inner_area_card_ppl_image">
                        <Link href={memberProfileHref}>
                          <img src={PLACEHOLDER_IMG} alt="" className="_box_ppl_img" />
                        </Link>
                      </div>
                      <div className="_feed_right_inner_area_card_ppl_txt">
                        <Link href={memberProfileHref}>
                          <h4 className="_feed_right_inner_area_card_ppl_title">{displayName(u)}</h4>
                        </Link>
                        <p className="_feed_right_inner_area_card_ppl_para">Buddy member</p>
                      </div>
                    </div>
                    <div className="_feed_right_inner_area_card_ppl_side">
                      <span>{formatRelativeTime(u.createdAt ?? new Date().toISOString())}</span>
                    </div>
                  </div>
                ))}
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
