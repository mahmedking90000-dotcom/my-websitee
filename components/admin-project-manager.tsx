"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string; name: string; reference: string; status: string; priority: string;
  createdAt: string; owner: { name: string | null; email: string };
};
const statuses = [
  ["NEW_REQUEST", "طلب جديد"], ["UNDER_REVIEW", "قيد المراجعة"],
  ["AWAITING_APPROVAL", "بانتظار الموافقة"], ["IN_PROGRESS", "قيد التنفيذ"],
  ["DESIGN_STAGE", "مرحلة التصميم"], ["DEVELOPMENT_STAGE", "مرحلة التطوير"],
  ["TESTING", "الاختبار"], ["COMPLETED", "مكتمل"],
  ["DELIVERED", "تم التسليم"], ["CANCELLED", "ملغي"],
];
const priorities = [["LOW","منخفضة"],["NORMAL","عادية"],["HIGH","مرتفعة"],["URGENT","عاجلة"]];
export default function AdminProjectManager({ projects, canManage }: { projects: Project[]; canManage: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [updates, setUpdates] = useState<Record<string,{title:string;body:string}>>({});
  async function save(id:string, patch:Record<string,string>) {
    setBusy(id); setNotice("");
    try {
      const response = await fetch("/api/admin/projects/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(patch)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر حفظ التعديل");
      setNotice("تم تحديث المشروع بنجاح."); router.refresh();
    } catch(error) { setNotice(error instanceof Error ? error.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(null); }
  }
  return <div className="mt-6 space-y-4">
    {notice && <p role="status" className="rounded-xl border border-violet-200/20 bg-violet-200/10 p-3 text-sm text-violet-100">{notice}</p>}
    {projects.map(project => <article key={project.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-bold">{project.name}</h2><p className="mt-1 text-xs text-white/45">{project.owner.name || project.owner.email} · {project.reference}</p><p className="mt-1 text-xs text-white/35">تاريخ الطلب: {new Date(project.createdAt).toLocaleDateString("ar-EG")}</p></div>
        <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1.5 text-xs text-violet-100">{statuses.find(([v])=>v===project.status)?.[1] || project.status}</span>
      </div>
      {canManage ? <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-xs text-white/55">حالة المشروع<select aria-label="حالة المشروع" defaultValue={project.status} onChange={e=>save(project.id,{status:e.target.value})} disabled={busy===project.id} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white">{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label className="text-xs text-white/55">الأولوية<select aria-label="أولوية المشروع" defaultValue={project.priority} onChange={e=>save(project.id,{priority:e.target.value})} disabled={busy===project.id} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white">{priorities.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <span className="self-end pb-3 text-xs text-white/40">{busy===project.id?"جارٍ الحفظ…":"التغييرات تُحفظ فورًا"}</span>
      </div> : <p className="mt-4 text-xs text-white/40">صلاحية العرض فقط</p>}
      {canManage && <details className="mt-4 border-t border-white/10 pt-4"><summary className="cursor-pointer text-sm font-semibold text-violet-200">إضافة تحديث للعميل</summary>
        <div className="mt-3 grid gap-3"><input value={updates[project.id]?.title||""} onChange={e=>setUpdates(s=>({...s,[project.id]:{title:e.target.value,body:s[project.id]?.body||""}}))} maxLength={160} placeholder="عنوان التحديث" className="rounded-xl border border-white/10 bg-slate-900 p-3 text-sm"/><textarea value={updates[project.id]?.body||""} onChange={e=>setUpdates(s=>({...s,[project.id]:{title:s[project.id]?.title||"",body:e.target.value}}))} maxLength={5000} rows={3} placeholder="اكتب تفاصيل التحديث التي ستظهر للعميل" className="rounded-xl border border-white/10 bg-slate-900 p-3 text-sm"/><button disabled={busy===project.id||!updates[project.id]?.title?.trim()||!updates[project.id]?.body?.trim()} onClick={()=>save(project.id,{updateTitle:updates[project.id].title,updateBody:updates[project.id].body})} className="w-fit rounded-xl bg-violet-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40">نشر التحديث</button></div>
      </details>}
    </article>)}
    {!projects.length && <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-white/45">لا توجد مشاريع حتى الآن.</p>}
  </div>;
}
