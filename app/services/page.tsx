import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const defaultServices = [
  ["تصميم وتطوير المواقع", "مواقع سريعة ومتجاوبة تعكس احترافية نشاطك وتعمل بسلاسة على مختلف الأجهزة."],
  ["المتاجر الإلكترونية", "متاجر منظمة لعرض المنتجات وتسهيل رحلة الشراء وإدارة الطلبات."],
  ["تصميم UI/UX", "واجهات واضحة وتجارب استخدام مدروسة تجعل التعامل مع منتجك أسهل."],
  ["حلول رقمية مخصصة", "تطبيقات ويب ولوحات تحكم مصممة لتناسب طريقة عملك واحتياجات فريقك."],
  ["الهوية البصرية", "عناصر بصرية متناسقة تمنح علامتك حضورًا واضحًا ويمكن تمييزه."],
  ["الصيانة والتطوير", "متابعة فنية وتحسينات مستمرة للحفاظ على أداء موقعك وتحديثه."]
] as const;

function arabicText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "ar" in value) {
    const localized = (value as { ar?: unknown }).ar;
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

export default async function Services() {
  const items = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  const cards = items.length
    ? items.map(item => ({
        key: item.id,
        title: arabicText(item.title) || item.slug,
        description: arabicText(item.description)
      }))
    : defaultServices.map(([title, description], index) => ({
        key: "default-" + index,
        title,
        description
      }));

  return (
    <main dir="rtl" className="site-shell min-h-screen bg-[#080b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <p className="mt-12 text-xs tracking-[.25em] text-violet-300">WHAT WE DO</p>
        <h1 className="mt-3 text-4xl font-bold">خدماتنا</h1>
        <p className="mt-4 max-w-2xl leading-8 text-white/55">حلول رقمية تبدأ من فهم احتياجك، وتمر بتصميم وتنفيذ واضحين، وتنتهي بتجربة تساعد مشروعك على النمو.</p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, index) => (
            <article key={item.key} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-xs text-violet-200">0{index + 1}</span>
              <h2 className="mt-5 text-xl font-bold">{item.title}</h2>
              <p className="mt-3 leading-7 text-white/60">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[.04] p-7">
          <h2 className="text-2xl font-bold">لديك احتياج مختلف؟</h2>
          <p className="mt-3 text-sm leading-7 text-white/55">أرسل تفاصيل فكرتك لنساعدك في تحديد الحل المناسب ونطاق العمل.</p>
          <Link href="/start-project" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-bold text-slate-950">ابدأ مشروعك</Link>
        </div>
      </div>
    </main>
  );
}
