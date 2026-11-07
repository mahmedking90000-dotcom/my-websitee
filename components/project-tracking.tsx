"use client";

import { CheckCircle2, Circle, Clock3, PackageCheck, XCircle } from "lucide-react";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

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
  { key: "NEW_REQUEST", label: "projectReceived", hint: "stageNewHint" },
  { key: "UNDER_REVIEW", label: "stageReview", hint: "stageReviewHint" },
  { key: "AWAITING_APPROVAL", label: "stageContacted", hint: "stageContactedHint" },
  { key: "IN_PROGRESS", label: "stageStarting", hint: "stageStartingHint" },
  { key: "DESIGN_STAGE", label: "stageDesign", hint: "stageDesignHint" },
  { key: "DEVELOPMENT_STAGE", label: "stageDevelopment", hint: "stageDevelopmentHint" },
  { key: "TESTING", label: "stageTesting", hint: "stageTestingHint" },
  { key: "COMPLETED", label: "stageCompleted", hint: "stageCompletedHint" },
  { key: "DELIVERED", label: "stageDelivered", hint: "stageDeliveredHint" }
];

const milestoneTitleMap: Record<string, string> = {
  "تم استلام المشروع": "projectReceived",
  "جاري مراجعة الطلب": "stageReview",
  "تم التواصل مع العميل": "stageContactedCustomer",
  "تم التواصل معك": "stageContacted",
  "جاري بدء العمل": "stageStarting",
  "مرحلة التصميم": "stageDesign",
  "مرحلة التطوير": "stageDevelopment",
  "الاختبار والمراجعة": "stageTesting",
  "اكتمل المشروع": "stageCompleted",
  "تم التسليم": "stageDelivered",
  "تم إلغاء المشروع": "cancelledProject",
  "تم الاتفاق على تفاصيل المشروع": "agreementDetails",
  "تم تأكيد الميزانية وموعد التنفيذ": "budgetSchedule",
  "تم الانتهاء من التصميم": "designDone",
  "بدأت مرحلة التطوير": "developmentStarted",
  "جاري الاختبار والمراجعة": "testingProgress",
  "تم الانتهاء من المشروع": "projectDone",
  "تم تسليم المشروع": "projectDelivered",
  "Project received": "projectReceived",
  "Request under review": "stageReview",
  "Customer contacted": "stageContactedCustomer",
  "Work is starting": "stageStarting",
  "Design": "stageDesign",
  "Development": "stageDevelopment",
  "Testing & review": "stageTesting",
  "Project completed": "stageCompleted",
  "Project delivered": "stageDelivered"
};

function formatDate(value: Date | string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function ProjectTracking({ status, createdAt, updates }: ProjectTrackingProps) {
  const { locale, t } = useWorkspacePreferences();
  const currentIndex = steps.findIndex(step => step.key === status);
  const cancelled = status === "CANCELLED";
  const currentStep = steps[currentIndex];

  function titleForUpdate(title: string) {
    const key = milestoneTitleMap[title];
    return key ? t(key) : title;
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-400/[.09] via-white/[.035] to-teal-300/[.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-violet-200">PROJECT TRACKING</p>
          <h2 className="mt-1 text-xl font-bold">{t("projectTracking")}</h2>
          <p className="mt-1 text-sm text-white/45">{t("projectTrackingDescription")}</p>
        </div>
        <span className={`rounded-full border px-3 py-2 text-xs font-bold ${cancelled ? "border-rose-300/20 bg-rose-300/10 text-rose-200" : "border-violet-300/20 bg-violet-300/10 text-violet-100"}`}>
          {cancelled ? t("cancelledProject") : currentStep ? t(currentStep.label) : t("projectReceived")}
        </span>
      </div>

      {cancelled ? (
        <div className="flex items-start gap-3 px-5 py-6 sm:px-6">
          <XCircle className="mt-0.5 shrink-0 text-rose-300" size={22}/>
          <div>
            <p className="font-semibold text-rose-100">{t("projectStopped")}</p>
            <p className="mt-1 text-sm leading-7 text-white/55">{t("contactNova")}</p>
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
                  <span className={`block text-sm font-semibold ${active ? "text-violet-100" : complete ? "text-teal-100/90" : "text-white/40"}`}>{t(step.label)}</span>
                  <span className={`mt-1 block text-xs leading-6 ${active ? "text-white/65" : "text-white/30"}`}>{t(step.hint)}</span>
                  {active && <span className="mt-1 inline-flex rounded-full bg-violet-300/10 px-2 py-1 text-[10px] text-violet-100">{t("currentPhase")}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-t border-white/10 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <PackageCheck size={18} className="text-violet-200"/>
          <h3 className="font-bold">{t("trackingLog")}</h3>
        </div>
        <div className="space-y-0">
          <div className="relative flex gap-3 pb-4">
            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-300 ring-4 ring-teal-300/10"/>
            <div>
              <p className="text-sm font-semibold text-white/85">{t("projectReceived")}</p>
              <p className="mt-1 text-xs text-white/40">{formatDate(createdAt, locale)}</p>
            </div>
          </div>
          {updates.map(update => (
            <div key={update.id} className="relative flex gap-3 border-s border-white/10 pb-4 ps-4">
              <span className="absolute -start-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-300 ring-4 ring-violet-300/10"/>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/85">{titleForUpdate(update.title)}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-white/55">{update.body}</p>
                <p className="mt-1 text-xs text-white/35">{formatDate(update.createdAt, locale)}</p>
              </div>
            </div>
          ))}
          {!updates.length && <p className="text-xs text-white/40">{t("noUpdates")}</p>}
        </div>
      </div>
    </section>
  );
}
