"use client";

import { useState } from "react";
import Link from "next/link";

type ContactForm = { name: string; email: string; phone: string; subject: string; message: string };

export default function Contact() {
  const [values, setValues] = useState<ContactForm>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      setMessage(data.message || data.error || "تعذر الإرسال.");
      if (response.ok) setValues({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="site-shell min-h-screen bg-[#080b14] p-6 text-white">
      <div className="mx-auto max-w-2xl py-16">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <h1 className="mt-8 text-4xl font-bold">تواصل معنا</h1>
        <p className="mt-3 text-white/50">احكيلنا عن استفسارك وسنعود إليك.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {([
            ["name", "الاسم"],
            ["email", "البريد الإلكتروني"],
            ["phone", "رقم الهاتف"],
            ["subject", "الموضوع"]
          ] as const).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                required={key === "name" || key === "email"}
                type={key === "email" ? "email" : "text"}
                value={values[key]}
                onChange={event => setValues(current => ({ ...current, [key]: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3"
              />
            </label>
          ))}
          <label className="block text-sm">
            الرسالة
            <textarea
              required
              minLength={10}
              rows={5}
              value={values.message}
              onChange={event => setValues(current => ({ ...current, message: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3"
            />
          </label>
          <button disabled={loading} className="rounded-xl bg-white px-6 py-3 font-bold text-slate-950 disabled:opacity-60">
            {loading ? "جارٍ الإرسال..." : "إرسال"}
          </button>
          {message && <p role="status" className="text-sm text-violet-200">{message}</p>}
        </form>
        <a className="mt-8 inline-block text-sm text-emerald-200" href="https://wa.me/201116013702">أو تواصل عبر واتساب</a>
      </div>
    </main>
  );
}
