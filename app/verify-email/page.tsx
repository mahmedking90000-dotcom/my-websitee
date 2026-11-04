"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "تعذر إرسال الرسالة.");
      else setMessage(data.message || "تم إرسال الطلب.");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!token) return;
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "تعذر تأكيد البريد الإلكتروني.");
      else setMessage(data.message || "تم تأكيد البريد الإلكتروني.");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.06] p-8">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <h1 className="mt-8 text-3xl font-bold">تأكيد البريد الإلكتروني</h1>
        {token ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/60">اضغط على الزر لتأكيد بريدك الإلكتروني. لن يتم تفعيل الرابط بمجرد فتحه.</p>
            <button type="button" disabled={loading} onClick={() => void confirm()} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "جارٍ التأكيد..." : "تأكيد البريد الإلكتروني"}
            </button>
          </>
        ) : (
          <form onSubmit={resend}>
            <p className="mt-3 text-sm leading-7 text-white/60">اكتب البريد الذي سجلت به، وسنرسل رابط تأكيد جديدًا إذا كان الحساب يحتاج إلى التفعيل.</p>
            <label className="mt-6 block text-sm">البريد الإلكتروني
              <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3" />
            </label>
            <button disabled={loading} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "جارٍ الإرسال..." : "إعادة إرسال رابط التأكيد"}
            </button>
          </form>
        )}
        {message && <p role="status" className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <p className="mt-5 text-sm text-white/60"><Link href="/login" className="underline underline-offset-4">العودة لتسجيل الدخول</Link></p>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">جارٍ تحميل صفحة التأكيد...</main>}><VerifyEmailContent /></Suspense>;
}
