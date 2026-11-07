import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const defaultFaqs = [
  ["ما الخدمات التي تقدمها NOVA؟", "نقدم تصميم وتطوير المواقع والمتاجر الإلكترونية وصفحات الهبوط وتطبيقات الويب وتصميم UI/UX والصيانة والتطوير."],
  ["كيف أحصل على عرض سعر؟", "أرسل تفاصيل فكرتك من صفحة ابدأ مشروعك. نراجع نطاق العمل والمتطلبات ثم نجهز عرضًا مناسبًا."],
  ["هل يمكن تنفيذ فكرة مخصصة؟", "نعم، يمكننا مراجعة احتياجك وتحديد الوظائف والتكاملات المطلوبة قبل تقدير نطاق التنفيذ."],
  ["هل يعمل الموقع على الهاتف؟", "نصمم الواجهات لتكون متجاوبة مع شاشات الهاتف والتابلت والحاسوب، ثم نراجعها قبل التسليم."],
  ["هل تقدمون دعمًا بعد الإطلاق؟", "يمكن الاتفاق على الصيانة والتحديثات والدعم الفني ضمن نطاق واضح بعد تسليم المشروع."]
] as const;

function arabicText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "ar" in value) {
    const localized = (value as { ar?: unknown }).ar;
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

export default async function Faq() {
  const items = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  const questions = items.length
    ? items.map(item => ({
        id: item.id,
        question: arabicText(item.question),
        answer: arabicText(item.answer)
      }))
    : defaultFaqs.map(([question, answer], index) => ({
        id: "default-" + index,
        question,
        answer
      }));

  return (
    <main dir="rtl" className="site-shell min-h-screen bg-[#080b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-bold">NOVA.</Link>
        <p className="mt-12 text-xs tracking-[.25em] text-violet-300">HELP CENTER</p>
        <h1 className="mt-3 text-4xl font-bold">الأسئلة الشائعة</h1>
        <div className="mt-8 space-y-3">
          {questions.map(item => (
            <details key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <p className="mt-3 leading-8 text-white/60">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.04] p-6">
          <p className="text-white/65">لم تجد إجابة سؤالك؟ تواصل معنا وسنساعدك.</p>
          <Link href="/contact" className="mt-4 inline-flex text-sm text-violet-200 underline underline-offset-4">تواصل معنا</Link>
        </div>
      </div>
    </main>
  );
}
