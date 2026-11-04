"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verify = new URLSearchParams(window.location.search).get("verify");
    if (verify === "success") setNotice("تم تأكيد بريدك الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن.");
    if (verify === "expired") setError("رابط التأكيد غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.");
    if (verify === "invalid") setError("رابط التأكيد غير مكتمل. اطلب رسالة جديدة.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/portal";
      const result = await signIn("credentials", { email, password, redirect: false, redirectTo: callbackUrl });
      if (result?.error) setError("بيانات الدخول غير صحيحة أو البريد لم يتم تأكيده.");
      else window.location.assign(callbackUrl);
    } catch {
      setError("تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.06] p-8">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <h1 className="mt-8 text-3xl font-bold">تسجيل الدخول</h1>
        {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</p>}
        <label className="mt-7 block text-sm">البريد الإلكتروني
          <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3" />
        </label>
        <label className="mt-4 block text-sm">كلمة المرور
          <input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3" />
        </label>
        {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
        </button>
        <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-white/60">
          <Link href="/register">إنشاء حساب</Link>
          <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>
        <p className="mt-4 text-sm text-white/60">لم تؤكد بريدك؟ <Link href="/verify-email" className="underline underline-offset-4">إعادة إرسال رابط التأكيد</Link></p>
      </form>
    </main>
  );
}
