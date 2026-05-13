import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/feed");

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="container py-5 text-center">
        <p className="_social_login_content_para _mar_b8">Buddy Script</p>
        <h4 className="_social_login_content_title _titl4 _mar_b50">Welcome</h4>
        <Link className="_social_login_form_btn_link _btn1 d-inline-block px-5" href="/login">
          Login
        </Link>
        <p className="_social_login_bottom_txt_para mt-4">
          New here?{" "}
          <Link href="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
