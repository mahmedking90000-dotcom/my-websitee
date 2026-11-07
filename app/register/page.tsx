"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

type RegisterValues = { name: string; email: string; phone: string; password: string };

export default function Register() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordIsStrong =
    values.password.length >= 12 &&
    values.password.length <= 72 &&
    new TextEncoder().encode(values.password).length <= 72 &&
    /[a-z]/.test(values.password) &&
    /[A-Z]/.test(values.password) &&
    /[0-9]/.test(values.password) &&
    /[\p{P}\p{S}]/u.test(values.password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!passwordIsStrong) {
      setError("استخدم 12 حرفًا على الأقل، مع حرف كبير وصغير ورقم ورمز خاص.");
      return;
    }

    setLoading(true);
    try {
      const email = values.email.trim().toLowerCase();
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, email })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "تعذر إنشاء الحساب.");
        return;
      }

      // Sign the customer in immediately after account creation.
      const result = await signIn("credentials", {
        email,
        password: values.password,
        redirect: false,
        redirectTo: "/portal"
      });

      if (result?.error) {
        router.push("/login?registered=success");
      } else {
        window.location.assign("/portal");
      }
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] p-5 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.06] p-8">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <h1 className="mt-8 text-3xl font-bold">إنشاء حساب</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">
          سجّل بياناتك مرة واحدة، وسيتم حفظ حسابك لتقدر تدخل في أي وقت بنفس البريد وكلمة المرور.
        </p>
        {([
          ["name", "الاسم الكامل", "text"],
          ["email", "البريد الإلكتروني", "email"],
          ["phone", "رقم الهاتف (اختياري)", "tel"],
          ["password", "كلمة مرور قوية", "password"]
        ] as const).map(([key, label, type]) => (
          <label key={key} className="mt-4 block text-sm">
            {label}
            <input
              required={key !== "phone"}
              minLength={key === "password" ? 12 : undefined}
              maxLength={key === "password" ? 72 : undefined}
              autoComplete={key === "password" ? "new-password" : key === "email" ? "email" : key === "name" ? "name" : "tel"}
              type={type}
              value={values[key]}
              onChange={event => setValues(current => ({ ...current, [key]: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 p-3"
            />
            {key === "password" && (
              <span className={`mt-2 block text-xs leading-6 ${passwordIsStrong ? "text-emerald-300" : "text-white/50"}`}>
                12 حرفًا على الأقل، ويحتوي على حرف كبير وصغير ورقم ورمز خاص مثل ! أو @.
              </span>
            )}
          </label>
        ))}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-white p-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
        </button>
        <p className="mt-5 text-sm text-white/60">
          تأكيد البريد الإلكتروني: <Link href="/verify-email" className="underline underline-offset-4">غير مفعّل حاليًا</Link>
        </p>
        <p className="mt-3 text-sm text-white/60">لديك حساب؟ <Link href="/login" className="underline underline-offset-4">سجّل الدخول</Link></p>
      </form>
    </main>
  );
}
