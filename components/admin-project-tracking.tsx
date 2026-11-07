"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Clock3, Save } from "lucide-react";

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

const statusOptions: { value: Status; label: string }[] = [
  { value: "NEW_REQUEST", label: "تم استلام المشروع" },
  { value: "UNDER_REVIEW", label: "جاري مراجعة الطلب" },
  { value: "AWAITING_APPROVAL", label: "تم التواصل مع العميل" },
  { value: "IN_PROGRESS", label: "جاري بدء العمل" },
  { value: "DESIGN_STAGE", label: "مرحلة التصميم" },
  { value: "DEVELOPMENT_STAGE", label: "مرحلة التطوير" },
  { value: "TESTING", label: "الاختبار والمراجعة" },
  { value: "COMPLETED", label: "اكتمل المشروع" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "تم إلغاء المشروع" }
];

const milestoneTemplates = [
  "تم التواصل مع العميل",
  "تم الاتفاق على تفاصيل المشروع",
  "تم تأكيد الميزانية وموعد التنفيذ",
  "جاري بدء العمل",
  "تم الانتهاء من التصميم",
  "بدأت مرحلة التطوير",
  "جاري الاختبار والمراجعة",
  "تم الانتهاء من المشروع",
  "تم تسليم المشروع"
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminProjectTracking({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [openId, setOpenId] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [form, setForm] = useState<Record<string, { status: Status; title: string; body: string }>>(() =>
    Object.fromEntries(initialProjects.map(project => [project.id, { status: project.status, title: "", body: "" }]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; text: string }>>({});

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
      setFeedback(current => ({ ...current, [project.id]: { ok: false, text: "اكتب عنوان التحديث وتفاصيله معًا." } }));
      return;
    }
    if (!statusChanged && !hasTitle) {
      setFeedback(current => ({ ...current, [project.id]: { ok: false, text: "غيّر الحالة أو أضف تحديثًا قبل الحفظ." } }));
      return;
    }

    setSavingId(project.id);
    setFeedback(current => ({ ...current, [project.id]: { ok: true, text: "جارٍ حفظ المتابعة..." } }));

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
      if (!response.ok) throw new Error(data.error || "تعذر حفظ تحديث المشروع.");

      setProjects(current => current.map(item => item.id === project.id ? { ...item, status: values.status } : item));
      setForm(current => ({ ...current, [project.id]: { ...current[project.id], title: "", body: "" } }));
      setFeedback(current => ({ ...current, [project.id]: { ok: true, text: "تم تحديث متابعة المشروع وإشعار العميل." } }));
      router.refresh();
    } catch (error) {
      setFeedback(current => ({
        ...current,
        [project.id]: { ok: false, text: error instanceof Error ? error.message : "حدث خطأ غير متوقع." }
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
        const statusLabel = statusOptions.find(option => option.value === project.status)?.label ?? project.status;
        return (
          <article key={project.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]">
            <button
              type="button"
              onClick={() => setOpenId(expanded ? null : project.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-right sm:p-5"
              aria-expanded={expanded}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-white/90">{project.name}</span>
                <span className="mt-1 block text-xs text-white/45">{project.ownerName || "عميل"} · {project.ownerEmail} · {project.reference}</span>
                <span className="mt-2 inline-flex rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-xs text-violet-100">{statusLabel}</span>
              </span>
              <span className="flex items-center gap-2 text-xs text-white/40">
                <Clock3 size={15}/>
                {project.updates.length} تحديث
                {expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}
              </span>
            </button>

            {expanded && (
              <div className="border-t border-white/10 p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm font-semibold text-white/75">
                    حالة المشروع الحالية
                    <select
                      value={values.status}
                      onChange={event => updateForm(project.id, { status: event.target.value as Status })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#171b2a] p-3 text-sm text-white"
                    >
                      {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-white/75">
                    تحديث سريع للعميل
                    <select
                      value={values.title}
                      onChange={event => updateForm(project.id, { title: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#171b2a] p-3 text-sm text-white"
                    >
                      <option value="">اختر مرحلة أو تحديثًا (اختياري)</option>
                      {milestoneTemplates.map(title => <option key={title} value={title}>{title}</option>)}
                    </select>
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold text-white/75">
                  تفاصيل التحديث التي ستظهر للعميل
                  <textarea
                    value={values.body}
                    onChange={event => updateForm(project.id, { body: event.target.value })}
                    rows={3}
                    maxLength={5000}
                    placeholder="مثال: تم التواصل معك ومراجعة المتطلبات، ونعمل حاليًا على تأكيد تفاصيل التنفيذ."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] p-3 text-sm text-white placeholder:text-white/30"
                  />
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-white/35">تغيير الحالة يسجل خطوة تلقائيًا في سجل المتابعة. ويمكنك إضافة تحديث مستقل للعميل.</p>
                  <button
                    type="button"
                    onClick={() => void save(project)}
                    disabled={savingId === project.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-200 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Save size={16}/>
                    {savingId === project.id ? "جارٍ الحفظ..." : "حفظ وإشعار العميل"}
                  </button>
                </div>
                {feedback[project.id] && (
                  <p role="status" className={`mt-3 text-sm ${feedback[project.id].ok ? "text-teal-200" : "text-rose-300"}`}>{feedback[project.id].text}</p>
                )}

                <div className="mt-6 border-t border-white/10 pt-4">
                  <h4 className="mb-3 text-sm font-bold">آخر التحديثات المسجلة</h4>
                  <div className="space-y-3">
                    {project.updates.slice(0, 4).map(update => (
                      <div key={update.id} className="border-r border-violet-300/30 pr-3">
                        <p className="text-sm font-semibold text-white/80">{update.title}</p>
                        <p className="mt-1 text-xs leading-6 text-white/45">{update.body}</p>
                        <p className="mt-1 text-[10px] text-white/30">{formatDate(update.createdAt)}</p>
                      </div>
                    ))}
                    {!project.updates.length && <p className="text-xs text-white/35">لا توجد تحديثات سابقة.</p>}
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}
      {!projects.length && <p className="rounded-2xl border border-white/10 p-6 text-white/50">لا توجد مشاريع لمتابعتها حتى الآن.</p>}
    </section>
  );
}
