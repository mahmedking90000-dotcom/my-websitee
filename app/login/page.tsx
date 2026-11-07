"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Sparkles } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "success";
  const verification = searchParams.get("verify");
  const verificationNotice = registered
    ? "تم إنشاء حسابك بنجاح. أدخل بريدك وكلمة المرور لتسجيل الدخول."
    : verification === "success" ? "يمكنك تسجيل الدخول إلى حسابك الآن." : "";
  const verificationError = verification === "expired" || verification === "invalid"
    ? "تأكيد البريد غير مفعّل حاليًا. يمكنك تسجيل الدخول مباشرة."
    : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const requested = searchParams.get("callbackUrl");
      const callbackUrl = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/portal";
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        redirectTo: callbackUrl
      });
      if (result?.error) setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      else window.location.assign(callbackUrl);
    } catch {
      setError("تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="nova-auth-page">
      <div className="nova-auth-card">
        <Link href="/" className="nova-auth-brand" aria-label="NOVA — الصفحة الرئيسية">
          <span className="nova-auth-brand-mark"><Sparkles size={20} /></span>
          <span>NOVA<span className="nova-auth-brand-dot">.</span></span>
        </Link>
        <div className="nova-auth-heading">
          <span className="nova-auth-eyebrow"><LockKeyhole size={14} /> مساحة آمنة</span>
          <h1>تسجيل الدخول</h1>
          <p>أهلاً بعودتك. سجّل دخولك لمتابعة مشاريعك ومساحتك الخاصة.</p>
        </div>
        {(notice || verificationNotice) && <p role="status" className="nova-auth-notice">{notice || verificationNotice}</p>}
        <form onSubmit={submit} className="nova-auth-form">
          <label>
            <span>البريد الإلكتروني</span>
            <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label>
            <span>كلمة المرور</span>
            <input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" />
          </label>
          {(error || verificationError) && <p role="alert" className="nova-auth-error">{error || verificationError}</p>}
          <button disabled={loading} type="submit" className="nova-auth-submit">
            {loading ? "جارٍ تسجيل الدخول..." : "دخول إلى حسابك"}
            {!loading && <ArrowUpRight size={18} />}
          </button>
        </form>
        <div className="nova-auth-links">
          <Link href="/register">إنشاء حساب جديد</Link>
          <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>
        <p className="nova-auth-verify">تأكيد البريد الإلكتروني: <Link href="/verify-email">غير مفعّل حاليًا</Link></p>
        <Link href="/" className="nova-auth-back">العودة إلى الموقع الرئيسي</Link>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<main className="nova-auth-page"><p>جارٍ تحميل صفحة تسجيل الدخول...</p></main>}>
      <LoginContent />
    </Suspense>
  );
}
