"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

const types = [
  { value: "Corporate Website", ar: "موقع شركة", en: "Corporate Website" },
  { value: "E-commerce Store", ar: "متجر إلكتروني", en: "E-commerce Store" },
  { value: "Landing Page", ar: "صفحة هبوط", en: "Landing Page" },
  { value: "Portfolio Website", ar: "موقع معرض أعمال", en: "Portfolio Website" },
  { value: "Personal Website", ar: "موقع شخصي", en: "Personal Website" },
  { value: "Booking Website", ar: "موقع حجوزات", en: "Booking Website" },
  { value: "Educational Platform", ar: "منصة تعليمية", en: "Educational Platform" },
  { value: "Custom Web Application", ar: "تطبيق ويب مخصص", en: "Custom Web Application" },
  { value: "Other", ar: "أخرى", en: "Other" }
];

const budgets = [
  { ar: "أقل من 300 دولار", en: "Under $300" },
  { ar: "300–500 دولار", en: "$300–500" },
  { ar: "500–1,000 دولار", en: "$500–1,000" },
  { ar: "1,000–2,500 دولار", en: "$1,000–2,500" },
  { ar: "2,500–5,000 دولار", en: "$2,500–5,000" },
  { ar: "أكثر من 5,000 دولار", en: "Over $5,000" },
  { ar: "ميزانية مخصصة", en: "Custom budget" }
];

export default function StartProject() {
  const router = useRouter();
  const { locale } = useWorkspacePreferences();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState({
    name: "",
    type: types[0].value,
    companyName: "",
    industry: "",
    description: "",
    goals: "",
    targetAudience: "",
    budgetRange: "",
    features: [] as string[],
    languages: ["Arabic", "English"],
    referenceUrls: [] as string[],
    priority: "NORMAL"
  });

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues(current => ({ ...current, [key]: value }));
  }

  async function send() {
    setMessage(locale === "ar" ? "جارٍ إرسال الطلب..." : "Submitting your request...");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    if (response.ok) router.push("/portal");
    else setMessage(data.error || (locale === "ar" ? "تعذر الإرسال." : "Unable to submit the request."));
  }

  const stepLabels = locale === "ar"
    ? ["نوع المشروع", "التفاصيل", "الأهداف", "الميزانية", "الأولوية", "المراجعة"]
    : ["Project type", "Details", "Goals", "Budget", "Priority", "Review"];

  return (
    <section className="mx-auto max-w-3xl">
      <p className="text-sm text-violet-200">
        {locale === "ar" ? "الخطوة" : "Step"} {step + 1} {locale === "ar" ? "من 6" : "of 6"} · {stepLabels[step]}
      </p>
      <div className="mt-3 h-1 rounded bg-white/10">
        <div className="h-1 rounded bg-violet-300" style={{ width: ((step + 1) / 6 * 100) + "%" }}/>
      </div>
      <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7">
        <h1 className="text-3xl font-bold">{locale === "ar" ? "ابدأ مشروعك" : "Start your project"}</h1>

        {step === 0 && (
          <label className="mt-7 block">
            {locale === "ar" ? "نوع المشروع" : "Project type"}
            <select value={values.type} onChange={event => set("type", event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3">
              {types.map(item => <option key={item.value} value={item.value}>{locale === "ar" ? item.ar : item.en}</option>)}
            </select>
          </label>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            {([
              ["name", locale === "ar" ? "اسم المشروع" : "Project name"],
              ["companyName", locale === "ar" ? "اسم الشركة" : "Company name"],
              ["industry", locale === "ar" ? "مجال النشاط" : "Industry"],
              ["targetAudience", locale === "ar" ? "الجمهور المستهدف" : "Target audience"]
            ] as const).map(([key, label]) => (
              <label key={key}>
                {label}
                <input value={values[key]} onChange={event => set(key, event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3"/>
              </label>
            ))}
            <label>
              {locale === "ar" ? "وصف المشروع" : "Project description"}
              <textarea value={values.description} onChange={event => set("description", event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3" rows={5}/>
            </label>
          </div>
        )}

        {step === 2 && (
          <label className="mt-7 block">
            {locale === "ar" ? "ما الهدف من المشروع؟" : "What is the project's goal?"}
            <textarea value={values.goals} onChange={event => set("goals", event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3" rows={5}/>
          </label>
        )}

        {step === 3 && (
          <label className="mt-7 block">
            {locale === "ar" ? "الميزانية المتوقعة" : "Estimated budget"}
            <select value={values.budgetRange} onChange={event => set("budgetRange", event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3">
              <option value="">{locale === "ar" ? "لم أحدد بعد" : "Not decided yet"}</option>
              {budgets.map(item => <option key={item.en} value={locale === "ar" ? item.ar : item.en}>{locale === "ar" ? item.ar : item.en}</option>)}
            </select>
          </label>
        )}

        {step === 4 && (
          <label className="mt-7 block">
            {locale === "ar" ? "درجة الاستعجال" : "Priority"}
            <select value={values.priority} onChange={event => set("priority", event.target.value)} className="mt-2 w-full rounded-xl bg-slate-900 p-3">
              <option value="LOW">{locale === "ar" ? "منخفض" : "Low"}</option>
              <option value="NORMAL">{locale === "ar" ? "عادي" : "Normal"}</option>
              <option value="HIGH">{locale === "ar" ? "مرتفع" : "High"}</option>
              <option value="URGENT">{locale === "ar" ? "عاجل" : "Urgent"}</option>
            </select>
          </label>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm">
            {Object.entries(values).map(([key, value]) => (
              <p key={key}><b>{key}:</b> {Array.isArray(value) ? value.join(", ") : String(value)}</p>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button type="button" disabled={!step} onClick={() => setStep(step - 1)} className="rounded-xl border border-white/20 px-5 py-3 disabled:opacity-30">
            {locale === "ar" ? "السابق" : "Previous"}
          </button>
          {step < 5 ? (
            <button type="button" onClick={() => setStep(step + 1)} disabled={step === 1 && (!values.name || values.description.length < 20)} className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-40">
              {locale === "ar" ? "التالي" : "Next"}
            </button>
          ) : (
            <button type="button" onClick={() => void send()} className="rounded-xl bg-violet-300 px-5 py-3 font-bold text-slate-950">
              {locale === "ar" ? "إرسال الطلب" : "Submit request"}
            </button>
          )}
        </div>
        {message && <p className="mt-4 text-sm text-amber-200">{message}</p>}
      </div>
    </section>
  );
}
