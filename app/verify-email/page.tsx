"use client";

import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const legacyToken = searchParams.get("token");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "تعذر تأكيد البريد الإلكتروني.");
      } else {
        setVerified(true);
        setMessage(data.message || "تم تأكيد بريدك الإلكتروني بنجاح.");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmLegacy() {
    if (!legacyToken) return;
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: legacyToken })
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "تعذر تأكيد البريد الإلكتروني.");
      else {
        setVerified(true);
        setMessage(data.message || "تم تأكيد بريدك الإلكتروني بنجاح.");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

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
      if (!response.ok) {
        setError(data.error || "تعذر إرسال الكود.");
      } else {
        setMessage(data.message || "إذا كان الحساب يحتاج إلى التأكيد، فسيصلك كود جديد.");
      }
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
        {legacyToken && !verified ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/60">هذه رسالة تأكيد قديمة. اضغط لتأكيد البريد الإلكتروني، أو ارجع لإنشاء كود جديد.</p>
            <button type="button" disabled={loading} onClick={() => void confirmLegacy()} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:opacity-60">
              {loading ? "جارٍ التأكيد..." : "تأكيد البريد الإلكتروني"}
            </button>
            {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          </>
        ) : verified ? (
          <>
            <p role="status" className="mt-5 rounded-xl bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-200">{message}</p>
            <Link href="/login" className="mt-6 block w-full rounded-xl bg-white p-3 text-center font-bold text-slate-950">الانتقال لتسجيل الدخول</Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-7 text-white/60">أدخل البريد الإلكتروني الذي سجلت به، ثم اكتب كود التأكيد المكوّن من 6 أرقام الذي أرسلته لك NOVA. الكود صالح لمدة 10 دقائق.</p>
            <form onSubmit={confirm} className="mt-6">
              <label className="block text-sm">البريد الإلكتروني
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3"
                />
              </label>
              <label className="mt-5 block text-sm">كود التأكيد
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="mt-2 w-full rounded-xl border border-violet-300/30 bg-black/20 p-4 text-center text-2xl font-bold tracking-[.5em] text-white"
                  dir="ltr"
                />
              </label>
              <button disabled={loading || code.length !== 6 || !email.trim()} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "جارٍ التأكيد..." : "تأكيد الحساب"}
              </button>
            </form>

            <form onSubmit={resend} className="mt-4">
              <button disabled={loading || !email.trim()} className="w-full rounded-xl border border-white/15 p-3 text-sm font-semibold text-white/80 disabled:opacity-50">
                {loading ? "جارٍ الإرسال..." : "إعادة إرسال كود التأكيد"}
              </button>
            </form>
            <p className="mt-4 text-xs leading-6 text-white/40">لأمان حسابك، لا تشارك الكود مع أي شخص. يمكنك طلب كود جديد بعد دقيقة من آخر إرسال.</p>
            {message && <p role="status" className="mt-4 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          </>
        )}
        <p className="mt-6 text-sm text-white/60"><Link href="/login" className="underline underline-offset-4">العودة لتسجيل الدخول</Link></p>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">جارٍ تحميل صفحة التأكيد...</main>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
