"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.06] p-8">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <h1 className="mt-8 text-3xl font-bold">تأكيد البريد الإلكتروني</h1>
        <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
          ميزة تأكيد البريد متوقفة حاليًا. لا تحتاج إلى إدخال كود؛ حسابك يعمل ويمكنك تسجيل الدخول مباشرة.
        </p>

        <label className="mt-6 block text-sm text-white/70">
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            disabled
            placeholder="name@example.com"
            className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 p-3 opacity-60"
          />
        </label>

        <label className="mt-5 block text-sm text-white/70">
          كود التأكيد
          <input
            type="text"
            inputMode="numeric"
            value=""
            disabled
            placeholder="000000"
            className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 p-4 text-center text-2xl tracking-[.5em] opacity-50"
            dir="ltr"
          />
        </label>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-xl bg-white p-3 font-bold text-slate-950 opacity-40"
          aria-disabled="true"
        >
          تأكيد البريد الإلكتروني (متوقف مؤقتًا)
        </button>
        <button
          type="button"
          disabled
          className="mt-3 w-full cursor-not-allowed rounded-xl border border-white/15 p-3 text-sm font-semibold text-white/50 opacity-50"
          aria-disabled="true"
        >
          إعادة إرسال كود التأكيد (متوقف مؤقتًا)
        </button>

        <Link href="/login" className="mt-6 block w-full rounded-xl bg-white p-3 text-center font-bold text-slate-950">
          الانتقال إلى تسجيل الدخول
        </Link>
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
