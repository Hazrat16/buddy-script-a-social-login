"use client";
import Link from "next/link";
import { useState } from "react";
import { BuddyAuthShapes } from "@/components/marketing/BuddyAuthShapes";
import { useBuddyAuthAssets } from "@/components/marketing/useBuddyAuthAssets";
function useHeroImgFallback() {
    return (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/assets/images/logo.svg";
    };
}
export default function RegisterPage() {
    useBuddyAuthAssets(true);
    const onHeroError = useHeroImgFallback();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        if (!agreeTerms) {
            setErr("Please agree to the terms & conditions.");
            return;
        }
        if (password !== repeat) {
            setErr("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErr(data.error || "Registration failed");
                return;
            }
            window.location.assign("/feed");
        }
        finally {
            setLoading(false);
        }
    }
    return (<section className="_social_registration_wrapper _layout_main_wrapper">
      <BuddyAuthShapes />
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/assets/images/registration.png" alt="" onError={onHeroError}/>
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/assets/images/registration1.png" alt="" onError={onHeroError}/>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="" className="_right_logo"/>
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40" title="Google sign-up is not enabled">
                  <img src="/assets/images/google.svg" alt="" className="_google_img"/> <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  {" "}
                  <span>Or</span>
                </div>
                <form className="_social_registration_form" onSubmit={onSubmit}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-fn">
                          First name
                        </label>
                        <input id="reg-fn" type="text" autoComplete="given-name" required className="form-control _social_registration_input" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-ln">
                          Last name
                        </label>
                        <input id="reg-ln" type="text" autoComplete="family-name" required className="form-control _social_registration_input" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-email">
                          Email
                        </label>
                        <input id="reg-email" type="email" autoComplete="email" required className="form-control _social_registration_input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-pw">
                          Password
                        </label>
                        <input id="reg-pw" type="password" autoComplete="new-password" required minLength={8} className="form-control _social_registration_input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-pw2">
                          Repeat Password
                        </label>
                        <input id="reg-pw2" type="password" autoComplete="new-password" required className="form-control _social_registration_input" value={repeat} onChange={(e) => setRepeat(e.target.value)}/>
                      </div>
                    </div>
                  </div>
                  {err ? (<div className="row">
                      <div className="col-12">
                        <p className="_notification_para" style={{ color: "#c00", marginBottom: 12 }}>
                          {err}
                        </p>
                      </div>
                    </div>) : null}
                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input className="form-check-input _social_registration_form_check_input" type="checkbox" id="regTermsRadio" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}/>
                        <label className="form-check-label _social_registration_form_check_label" htmlFor="regTermsRadio">
                          I agree to terms & conditions
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={loading}>
                          {loading ? "Creating account…" : "Register now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <Link href="/login">Log in</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);
}
