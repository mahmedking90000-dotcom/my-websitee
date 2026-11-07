import { CheckCircle2, Circle, Clock3, PackageCheck, XCircle } from "lucide-react";

export type ProjectTrackingUpdate = {
  id: string;
  title: string;
  body: string;
  createdAt: Date | string;
};

type ProjectTrackingProps = {
  status: string;
  createdAt: Date | string;
  updates: ProjectTrackingUpdate[];
};

const steps = [
  { key: "NEW_REQUEST", label: "تم استلام المشروع", hint: "تم تسجيل طلبك بنجاح." },
  { key: "UNDER_REVIEW", label: "جاري مراجعة الطلب", hint: "نراجع تفاصيل ومتطلبات المشروع." },
  { key: "AWAITING_APPROVAL", label: "تم التواصل معك", hint: "فريقنا يتابع معك التفاصيل والاتفاق." },
  { key: "IN_PROGRESS", label: "جاري بدء العمل", hint: "تم الاتفاق والبدء في تنفيذ المشروع." },
  { key: "DESIGN_STAGE", label: "مرحلة التصميم", hint: "نعمل على تصميم تجربة المشروع." },
  { key: "DEVELOPMENT_STAGE", label: "مرحلة التطوير", hint: "يتم تنفيذ وبناء المشروع." },
  { key: "TESTING", label: "الاختبار والمراجعة", hint: "نراجع التفاصيل ونتأكد من جودة العمل." },
  { key: "COMPLETED", label: "اكتمل المشروع", hint: "انتهى تنفيذ المشروع." },
  { key: "DELIVERED", label: "تم التسليم", hint: "تم تسليم المشروع إليك." }
];

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function ProjectTracking({ status, createdAt, updates }: ProjectTrackingProps) {
  const currentIndex = steps.findIndex(step => step.key === status);
  const cancelled = status === "CANCELLED";
  const currentStep = steps[currentIndex];

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[.09] via-white/[.035] to-teal-300/[.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-violet-200">PROJECT TRACKING</p>
          <h2 className="mt-1 text-xl font-bold">متابعة المشروع</h2>
          <p className="mt-1 text-sm text-white/45">تابع مراحل تنفيذ مشروعك خطوة بخطوة.</p>
        </div>
        <span className={`rounded-full border px-3 py-2 text-xs font-bold ${cancelled ? "border-rose-300/20 bg-rose-300/10 text-rose-200" : "border-violet-300/20 bg-violet-300/10 text-violet-100"}`}>
          {cancelled ? "تم إلغاء المشروع" : currentStep?.label ?? "تم استلام المشروع"}
        </span>
      </div>

      {cancelled ? (
        <div className="flex items-start gap-3 px-5 py-6 sm:px-6">
          <XCircle className="mt-0.5 shrink-0 text-rose-300" size={22}/>
          <div>
            <p className="font-semibold text-rose-100">تم إيقاف المشروع</p>
            <p className="mt-1 text-sm leading-7 text-white/55">راجع آخر تحديث بالأسفل أو تواصل مع فريق NOVA لمعرفة التفاصيل.</p>
          </div>
        </div>
      ) : (
        <ol className="grid gap-0 px-5 py-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
          {steps.map((step, index) => {
            const complete = currentIndex >= 0 && index < currentIndex;
            const active = index === currentIndex;
            return (
              <li key={step.key} className="relative flex gap-3 py-3 sm:pe-4">
                <span className="relative z-10 mt-0.5 shrink-0">
                  {complete ? (
                    <CheckCircle2 size={21} className="text-teal-300"/>
                  ) : active ? (
                    <Clock3 size={21} className="text-violet-200"/>
                  ) : (
                    <Circle size={21} className="text-white/20"/>
                  )}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${active ? "text-violet-100" : complete ? "text-teal-100/90" : "text-white/40"}`}>{step.label}</span>
                  <span className={`mt-1 block text-xs leading-6 ${active ? "text-white/65" : "text-white/30"}`}>{step.hint}</span>
                  {active && <span className="mt-1 inline-flex rounded-full bg-violet-300/10 px-2 py-1 text-[10px] text-violet-100">المرحلة الحالية</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-t border-white/10 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <PackageCheck size={18} className="text-violet-200"/>
          <h3 className="font-bold">سجل التحديثات</h3>
        </div>
        <div className="space-y-0">
          <div className="relative flex gap-3 pb-4">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-300 ring-4 ring-teal-300/10"/>
            <div>
              <p className="text-sm font-semibold text-white/85">تم استلام المشروع</p>
              <p className="mt-1 text-xs text-white/40">{formatDate(createdAt)}</p>
            </div>
          </div>
          {updates.map(update => (
            <div key={update.id} className="relative flex gap-3 border-r border-white/10 pb-4 pe-4">
              <span className="absolute -right-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-300 ring-4 ring-violet-300/10"/>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/85">{update.title}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-white/55">{update.body}</p>
                <p className="mt-1 text-xs text-white/35">{formatDate(update.createdAt)}</p>
              </div>
            </div>
          ))}
          {!updates.length && <p className="text-xs text-white/40">ستظهر هنا تحديثات الشركة فور إضافتها.</p>}
        </div>
      </div>
    </section>
  );
}
