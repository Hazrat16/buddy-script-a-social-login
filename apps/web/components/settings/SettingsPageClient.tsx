"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/components/feed/feed-types";
import { displayName } from "@/components/feed/feed-types";
import { UserAvatar } from "@/components/ui/UserAvatar";
const fetchOpts: RequestInit = { credentials: "include" };
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400";
export function SettingsPageClient() {
    const router = useRouter();
    const [me, setMe] = useState<PublicUser | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [profileErr, setProfileErr] = useState<string | null>(null);
    const [profileOk, setProfileOk] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdErr, setPwdErr] = useState<string | null>(null);
    const [pwdOk, setPwdOk] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
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
            const user = ud.user as PublicUser;
            setMe(user);
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email ?? "");
        })();
        return () => {
            cancelled = true;
        };
    }, [router]);
    async function onSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        setProfileErr(null);
        setProfileOk(false);
        setProfileSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                ...fetchOpts,
                body: JSON.stringify({ firstName, lastName, email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setProfileErr(typeof data.error === "string" ? data.error : "Could not save profile");
                return;
            }
            if (data.user) {
                const next = data.user as PublicUser;
                setMe(next);
                setFirstName(next.firstName);
                setLastName(next.lastName);
                setEmail(next.email ?? "");
            }
            setProfileOk(true);
            router.refresh();
        }
        finally {
            setProfileSaving(false);
        }
    }
    async function onChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setPwdErr(null);
        setPwdOk(false);
        if (newPassword !== confirmPassword) {
            setPwdErr("New passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            setPwdErr("New password must be at least 8 characters");
            return;
        }
        setPwdSaving(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                ...fetchOpts,
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwdErr(typeof data.error === "string" ? data.error : "Could not update password");
                return;
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPwdOk(true);
        }
        finally {
            setPwdSaving(false);
        }
    }
    if (!me) {
        return (<div className="flex min-h-screen flex-col">
        <div className="h-14 animate-pulse border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80"/>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"/>
        </div>
      </div>);
    }
    return (<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Account details and password for {displayName(me)}.</p>
          </div>
          <div className="flex items-center gap-3">
            <UserAvatar user={me} size={48}/>
            <Link href="/profile" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View profile
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 dark:shadow-card-dark">
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            <form className="p-5 sm:p-8" onSubmit={onSaveProfile}>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Account details</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update how you appear across Buddy and your sign-in email.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="settings-first" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      First name
                    </label>
                    <input id="settings-first" className={inputClass} autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                  </div>
                  <div>
                    <label htmlFor="settings-last" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Last name
                    </label>
                    <input id="settings-last" className={inputClass} autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="settings-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input id="settings-email" type="email" className={inputClass} autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                {profileErr ? (<p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    {profileErr}
                  </p>) : null}
                {profileOk ? (<p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Profile saved.
                  </p>) : null}
                <div className="mt-4">
                  <button type="submit" disabled={profileSaving} className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
                    {profileSaving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </div>
            </form>

            <form className="p-5 sm:p-8" onSubmit={onChangePassword}>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Password</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use at least 8 characters for your new password.</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="settings-pwd-current" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Current password
                    </label>
                    <input id="settings-pwd-current" type="password" className={inputClass} autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
                  </div>
                  <div>
                    <label htmlFor="settings-pwd-new" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      New password
                    </label>
                    <input id="settings-pwd-new" type="password" className={inputClass} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                  </div>
                  <div>
                    <label htmlFor="settings-pwd-confirm" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Confirm new password
                    </label>
                    <input id="settings-pwd-confirm" type="password" className={inputClass} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                  </div>
                </div>
                {pwdErr ? (<p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    {pwdErr}
                  </p>) : null}
                {pwdOk ? (<p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Password updated.
                  </p>) : null}
                <div className="mt-4">
                  <button type="submit" disabled={pwdSaving || !currentPassword || !newPassword || !confirmPassword} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                    {pwdSaving ? "Updating…" : "Update password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/profile" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            Back to profile
          </Link>
          <Link href="/feed" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Back to feed
          </Link>
        </div>
      </div>);
}
