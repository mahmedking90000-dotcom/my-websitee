"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordIsStrong =
    password.length >= 12 &&
    password.length <= 72 &&
    new TextEncoder().encode(password).length <= 72 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[\p{P}\p{S}]/u.test(password);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!passwordIsStrong) {
      setMessage("استخدم 12 حرفًا على الأقل، مع حرف كبير وصغير ورقم ورمز خاص.");
      return;
    }

    setLoading(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token") || "";
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      setMessage(data.message || data.error || "تعذر التحديث.");
    } catch {
      setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">
      <form onSubmit={save} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <Link href="/" className="font-bold">NOVA.</Link>
        <h1 className="mt-8 text-2xl font-bold">كلمة مرور جديدة</h1>
        <label className="mt-6 block text-sm">
          كلمة المرور الجديدة
          <input
            type="password"
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-900 p-3"
          />
        </label>
        <p className={`mt-2 text-xs leading-6 ${passwordIsStrong ? "text-emerald-300" : "text-white/50"}`}>
          12 حرفًا على الأقل، ويحتوي على حرف كبير وصغير ورقم ورمز خاص مثل ! أو @.
        </p>
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:opacity-60">
          {loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </button>
        {message && <p role="status" className="mt-4 text-sm text-violet-200">{message}</p>}
        <Link href="/login" className="mt-5 block text-sm text-white/60">تسجيل الدخول</Link>
      </form>
    </main>
  );
}
