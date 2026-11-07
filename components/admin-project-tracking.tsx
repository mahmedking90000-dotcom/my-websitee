"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Clock3, Save } from "lucide-react";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

type Status =
  | "NEW_REQUEST" | "UNDER_REVIEW" | "AWAITING_APPROVAL" | "IN_PROGRESS"
  | "DESIGN_STAGE" | "DEVELOPMENT_STAGE" | "TESTING" | "COMPLETED"
  | "DELIVERED" | "CANCELLED";

type ProjectItem = {
  id: string;
  name: string;
  reference: string;
  ownerName: string | null;
  ownerEmail: string;
  status: Status;
  priority: string;
  createdAt: string;
  updates: { id: string; title: string; body: string; createdAt: string }[];
};

const statusOptions: { value: Status; labelKey: string }[] = [
  { value: "NEW_REQUEST", labelKey: "stageReceived" },
  { value: "UNDER_REVIEW", labelKey: "stageReview" },
  { value: "AWAITING_APPROVAL", labelKey: "stageContacted" },
  { value: "IN_PROGRESS", labelKey: "stageStarting" },
  { value: "DESIGN_STAGE", labelKey: "stageDesignLabel" },
  { value: "DEVELOPMENT_STAGE", labelKey: "stageDevelopmentLabel" },
  { value: "TESTING", labelKey: "stageTestingLabel" },
  { value: "COMPLETED", labelKey: "stageCompleteLabel" },
  { value: "DELIVERED", labelKey: "stageDelivered" },
  { value: "CANCELLED", labelKey: "stageCancelled" }
];

const milestoneTemplates: { key: string; titleKey: string }[] = [
  { key: "contacted", titleKey: "stageContactedCustomer" },
  { key: "agreement", titleKey: "agreementDetails" },
  { key: "budget", titleKey: "budgetSchedule" },
  { key: "starting", titleKey: "stageStartingWork" },
  { key: "design", titleKey: "designDone" },
  { key: "development", titleKey: "developmentStarted" },
  { key: "testing", titleKey: "testingProgress" },
  { key: "completed", titleKey: "projectDone" },
  { key: "delivered", titleKey: "projectDelivered" }
];

function formatDate(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

const standardUpdateTitles: Record<string, string> = {
  "تم استلام المشروع": "stageReceived",
  "جاري مراجعة الطلب": "stageReview",
  "تم التواصل مع العميل": "stageContactedCustomer",
  "تم التواصل معك": "stageContacted",
  "جاري بدء العمل": "stageStarting",
  "مرحلة التصميم": "stageDesignLabel",
  "مرحلة التطوير": "stageDevelopmentLabel",
  "الاختبار والمراجعة": "stageTestingLabel",
  "اكتمل المشروع": "stageCompleteLabel",
  "تم التسليم": "stageDelivered",
  "تم إلغاء المشروع": "stageCancelled",
  "تم الاتفاق على تفاصيل المشروع": "agreementDetails",
  "تم تأكيد الميزانية وموعد التنفيذ": "budgetSchedule",
  "تم الانتهاء من التصميم": "designDone",
  "بدأت مرحلة التطوير": "developmentStarted",
  "جاري الاختبار والمراجعة": "testingProgress",
  "تم الانتهاء من المشروع": "projectDone",
  "تم تسليم المشروع": "projectDelivered"
};

function localizedUpdateTitle(title: string, t: (key: string) => string) {
  const key = standardUpdateTitles[title];
  if (key) return t(key);
  const status = statusOptions.find(option => option.labelKey && t(option.labelKey) === title);
  if (status) return t(status.labelKey);
  const milestone = milestoneTemplates.find(option => t(option.titleKey) === title);
  return milestone ? t(milestone.titleKey) : title;
}

export default function AdminProjectTracking({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const router = useRouter();
  const { locale, t } = useWorkspacePreferences();
  const [projects, setProjects] = useState(initialProjects);
  const [openId, setOpenId] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [form, setForm] = useState<Record<string, { status: Status; title: string; body: string }>>(() =>
    Object.fromEntries(initialProjects.map(project => [project.id, { status: project.status, title: "", body: "" }]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; text: string }>>({});

  useEffect(() => {
    setProjects(initialProjects);
    setForm(Object.fromEntries(initialProjects.map(project => [project.id, {
      status: project.status,
      title: "",
      body: ""
    }])));
  }, [initialProjects]);

  function updateForm(id: string, patch: Partial<{ status: Status; title: string; body: string }>) {
    setForm(current => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function save(project: ProjectItem) {
    const values = form[project.id];
    if (!values) return;

    const statusChanged = values.status !== project.status;
    const hasTitle = Boolean(values.title.trim());
    const hasBody = Boolean(values.body.trim());

    if (hasTitle !== hasBody) {
      setFeedback(current => ({ ...current, [project.id]: { ok: false, text: t("titleAndBodyTogether") } }));
      return;
    }
    if (!statusChanged && !hasTitle) {
      setFeedback(current => ({ ...current, [project.id]: { ok: false, text: t("changeStatusOrNote") } }));
      return;
    }

    setSavingId(project.id);
    setFeedback(current => ({ ...current, [project.id]: { ok: true, text: t("saveProgress") } }));

    const payload: { status?: Status; updateTitle?: string; updateBody?: string } = {};
    if (statusChanged) payload.status = values.status;
    if (hasTitle && hasBody) {
      payload.updateTitle = values.title.trim();
      payload.updateBody = values.body.trim();
    }

    try {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("messageSendError"));

      setProjects(current => current.map(item => item.id === project.id ? { ...item, status: values.status } : item));
      setForm(current => ({ ...current, [project.id]: { ...current[project.id], title: "", body: "" } }));
      setFeedback(current => ({ ...current, [project.id]: { ok: true, text: t("savedAndNotified") } }));
      router.refresh();
    } catch (error) {
      setFeedback(current => ({
        ...current,
        [project.id]: { ok: false, text: error instanceof Error ? error.message : t("messageSendError") }
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mt-6 space-y-3">
      {projects.map(project => {
        const expanded = openId === project.id;
        const values = form[project.id] ?? { status: project.status, title: "", body: "" };
        const statusLabel = statusOptions.find(option => option.value === project.status);
        const progressOptions = statusOptions.filter(option => option.value !== "CANCELLED");
        const currentProgressIndex = progressOptions.findIndex(option => option.value === values.status);
        return (
          <article key={project.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]">
            <button
              type="button"
              onClick={() => setOpenId(expanded ? null : project.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-start sm:p-5"
              aria-expanded={expanded}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-white/90">{project.name}</span>
                <span className="mt-1 block text-xs text-white/45">{project.ownerName || t("customerLabel")} · {project.ownerEmail} · {project.reference}</span>
                <span className="mt-2 inline-flex rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-xs text-violet-100">{statusLabel ? t(statusLabel.labelKey) : project.status}</span>
              </span>
              <span className="flex items-center gap-2 text-xs text-white/40">
                <Clock3 size={15}/>
                {project.updates.length} {t("updateCount")}
                {expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-white/10 p-4 sm:p-5">
                <div className="mb-5 rounded-xl border border-violet-300/15 bg-violet-300/[.04] p-4">
                  <h4 className="mb-3 text-sm font-bold text-violet-100">{t("projectTrackingPath")}</h4>
                  {values.status === "CANCELLED" ? (
                    <p className="text-sm text-rose-200">{t("stageCancelled")}</p>
                  ) : (
                    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {progressOptions.map((step, index) => {
                        const complete = currentProgressIndex >= 0 && index < currentProgressIndex;
                        const active = index === currentProgressIndex;
                        return (
                          <li key={step.value} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${complete ? "bg-teal-300" : active ? "bg-violet-200 ring-4 ring-violet-300/15" : "bg-white/20"}`} />
                            <span className={`text-xs ${active ? "font-bold text-violet-100" : complete ? "text-teal-100/80" : "text-white/40"}`}>{t(step.labelKey)}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm font-semibold text-white/75">
                    {t("projectStatus")}
                    <select
                      value={values.status}
                      onChange={event => updateForm(project.id, { status: event.target.value as Status })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#171b2a] p-3 text-sm text-white"
                    >
                      {statusOptions.map(option => <option key={option.value} value={option.value}>{t(option.labelKey)}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-white/75">
                    {t("quickClientUpdate")}
                    <select
                      value={values.title}
                      onChange={event => updateForm(project.id, { title: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#171b2a] p-3 text-sm text-white"
                    >
                      <option value="">{t("optionalMilestone")}</option>
                      {milestoneTemplates.map(template => <option key={template.key} value={t(template.titleKey)}>{t(template.titleKey)}</option>)}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold text-white/75">
                  {t("updateDetails")}
                  <textarea
                    value={values.body}
                    onChange={event => updateForm(project.id, { body: event.target.value })}
                    rows={3}
                    maxLength={5000}
                    placeholder={t("updateExample")}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] p-3 text-sm text-white placeholder:text-white/30"
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-white/35">{t("statusAutoLog")}</p>
                  <button
                    type="button"
                    onClick={() => void save(project)}
                    disabled={savingId === project.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-200 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Save size={16}/>
                    {savingId === project.id ? t("saving") : t("saveAndNotify")}
                  </button>
                </div>
                {feedback[project.id] && (
                  <p role="status" className={`mt-3 text-sm ${feedback[project.id].ok ? "text-teal-200" : "text-rose-300"}`}>{feedback[project.id].text}</p>
                )}

                <div className="mt-6 border-t border-white/10 pt-4">
                  <h4 className="mb-3 text-sm font-bold">{t("latestUpdates")}</h4>
                  <div className="space-y-3">
                    {project.updates.slice(0, 4).map(update => (
                      <div key={update.id} className="border-s-2 border-violet-300/30 ps-3">
                        <p className="text-sm font-semibold text-white/80">{localizedUpdateTitle(update.title, t)}</p>
                        <p className="mt-1 text-xs leading-6 text-white/45">{update.body}</p>
                        <p className="mt-1 text-[10px] text-white/30">{formatDate(update.createdAt, locale)}</p>
                      </div>
                    ))}
                    {!project.updates.length && <p className="text-xs text-white/35">{t("previousUpdatesEmpty")}</p>}
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}
      {!projects.length && <p className="rounded-2xl border border-white/10 p-6 text-white/50">{t("noProjectsToTrack")}</p>}
    </section>
  );
}
