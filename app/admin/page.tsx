import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, FolderKanban, Inbox, Activity, BadgeCheck, ReceiptText, ArrowUpLeft, Plus, Images, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  NEW_REQUEST: "طلب جديد", UNDER_REVIEW: "قيد المراجعة", AWAITING_APPROVAL: "بانتظار الموافقة",
  IN_PROGRESS: "قيد التنفيذ", DESIGN_STAGE: "مرحلة التصميم", DEVELOPMENT_STAGE: "مرحلة التطوير",
  TESTING: "الاختبار", COMPLETED: "مكتمل", DELIVERED: "تم التسليم", CANCELLED: "ملغي",
};

export default async function AdminHome() {
  const [customers, projects, newRequests, active, completed, invoices, latestProjects] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "NEW_REQUEST" } }),
    prisma.project.count({ where: { status: { in: ["IN_PROGRESS", "DESIGN_STAGE", "DEVELOPMENT_STAGE", "TESTING"] } } }),
    prisma.project.count({ where: { status: { in: ["COMPLETED", "DELIVERED"] } } }),
    prisma.invoice.count({ where: { status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] } } }),
    prisma.project.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true, email: true } } } }),
  ]);
  const cards = [
    { label: "إجمالي العملاء", value: customers, icon: Users, hint: "حسابات العملاء" },
    { label: "كل المشاريع", value: projects, icon: FolderKanban, hint: "جميع الطلبات والمشروعات" },
    { label: "طلبات جديدة", value: newRequests, icon: Inbox, hint: "تحتاج إلى مراجعة" },
    { label: "مشاريع نشطة", value: active, icon: Activity, hint: "قيد العمل حاليًا" },
    { label: "مكتملة / تم التسليم", value: completed, icon: BadgeCheck, hint: "تم إنجازها" },
    { label: "فواتير معلقة", value: invoices, icon: ReceiptText, hint: "تحتاج إلى متابعة" },
  ];
  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold tracking-[.18em] text-violet-200/70">مساحة العمل الإدارية</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">لوحة التحكم</h1><p className="mt-2 text-sm text-white/45">نظرة شاملة على نشاط NOVA وأحدث ما يحدث في منصتك.</p></div>
      <Link href="/admin/projects" className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-200"><Plus size={16}/> متابعة الطلبات</Link>
    </div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, hint }) => <article key={label} className="rounded-2xl border border-white/[.09] bg-gradient-to-br from-white/[.065] to-white/[.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,.12)]">
        <div className="flex items-center justify-between"><span className="text-sm text-white/60">{label}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><Icon size={19}/></span></div>
        <p className="mt-5 text-4xl font-black tabular-nums">{value.toLocaleString("ar-EG")}</p><p className="mt-2 text-xs text-white/35">{hint}</p>
      </article>)}
    </section>
    <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,.8fr)]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="font-bold">أحدث المشاريع والطلبات</h2><p className="mt-1 text-xs text-white/40">آخر الطلبات المسجلة في قاعدة البيانات</p></div><Link href="/admin/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-200 hover:text-violet-100">عرض الكل <ArrowUpLeft size={14}/></Link></div>
        {latestProjects.length ? <div className="divide-y divide-white/[.07]">{latestProjects.map(project => <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{project.name}</p><p className="mt-1 truncate text-xs text-white/40">{project.owner.name || project.owner.email} · {project.reference}</p></div><span className="rounded-full border border-violet-200/15 bg-violet-200/[.07] px-3 py-1.5 text-[11px] text-violet-100">{statusLabels[project.status] ?? project.status}</span></div>)}</div> : <p className="p-8 text-center text-sm text-white/40">لا توجد مشاريع حتى الآن. ستظهر الطلبات الجديدة هنا.</p>}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
        <h2 className="font-bold">اختصارات الإدارة</h2><p className="mt-1 text-xs text-white/40">انتقل مباشرة إلى الأقسام الأساسية</p>
        <div className="mt-4 grid gap-2">
          <Link href="/admin/content" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Images size={17} className="text-violet-200"/> المحتوى ومعرض الأعمال</span><ArrowUpLeft size={15}/></Link>
          <Link href="/admin/customers" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Users size={17} className="text-violet-200"/> إدارة العملاء</span><ArrowUpLeft size={15}/></Link>
          <Link href="/admin/settings" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Settings size={17} className="text-violet-200"/> إعدادات الموقع</span><ArrowUpLeft size={15}/></Link>
        </div>
      </div>
    </section>
  </div>;
}
