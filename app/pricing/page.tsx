import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const defaultPlans = [
  { name: "Starter", description: "صفحة هبوط أو موقع تعريفي بسيط.", features: ["تصميم متجاوب", "نموذج تواصل", "تهيئة SEO أساسية"] },
  { name: "Business", description: "موقع متكامل لنشاطك التجاري.", features: ["صفحات متعددة", "تصميم UI/UX مخصص", "إدارة محتوى حسب النطاق", "تهيئة SEO"] },
  { name: "Custom", description: "حل رقمي مصمم حسب احتياجات مشروعك.", features: ["وظائف مخصصة", "لوحات تحكم وتكاملات", "تخطيط تقني", "دعم حسب الاتفاق"] }
] as const;

function arabicText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "ar" in value) {
    const localized = (value as { ar?: unknown }).ar;
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export default async function Pricing() {
  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  const cards = plans.length
    ? plans.map(plan => ({
        key: plan.id,
        name: arabicText(plan.name) || plan.slug,
        description: arabicText(plan.description),
        features: stringList(plan.features),
        price: arabicText(plan.priceLabel) || "عرض سعر حسب الطلب"
      }))
    : defaultPlans.map((plan, index) => ({
        key: "default-" + index,
        ...plan,
        price: "عرض سعر حسب الطلب"
      }));

  return (
    <main dir="rtl" className="site-shell min-h-screen bg-[#080b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-bold">NOVA.</Link>
        <p className="mt-12 text-xs tracking-[.25em] text-teal-200">FLEXIBLE PACKAGES</p>
        <h1 className="mt-3 text-4xl font-bold">الباقات والأسعار</h1>
        <p className="mt-4 max-w-2xl leading-8 text-white/55">نحدد التكلفة بعد مراجعة متطلبات المشروع ونطاق العمل. لا نعرض سعرًا ثابتًا قبل الاتفاق على التفاصيل.</p>
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {cards.map(plan => (
            <article key={plan.key} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="mt-3 min-h-14 leading-7 text-white/60">{plan.description}</p>
              <p className="mt-6 text-sm font-semibold text-violet-200">{plan.price}</p>
              <ul className="my-6 flex-1 space-y-3 text-sm text-white/70">
                {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link href="/start-project" className="mt-4 inline-flex justify-center rounded-xl bg-white px-5 py-3 font-bold text-slate-950">اطلب عرض سعر</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
