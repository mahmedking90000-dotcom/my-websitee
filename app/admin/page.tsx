import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, FolderKanban, Inbox, Activity, BadgeCheck, ReceiptText, ArrowUpLeft, Plus, Images, Settings } from "lucide-react";
import { WorkspaceStatus, WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

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
    { label: ["إجمالي العملاء", "Total customers"], value: customers, icon: Users, hint: ["حسابات العملاء", "Customer accounts"] },
    { label: ["كل المشاريع", "All projects"], value: projects, icon: FolderKanban, hint: ["جميع الطلبات والمشروعات", "All project requests"] },
    { label: ["طلبات جديدة", "New requests"], value: newRequests, icon: Inbox, hint: ["تحتاج إلى مراجعة", "Need review"] },
    { label: ["مشاريع نشطة", "Active projects"], value: active, icon: Activity, hint: ["قيد العمل حاليًا", "Currently in progress"] },
    { label: ["مكتملة / تم التسليم", "Completed / delivered"], value: completed, icon: BadgeCheck, hint: ["تم إنجازها", "Successfully finished"] },
    { label: ["فواتير معلقة", "Pending invoices"], value: invoices, icon: ReceiptText, hint: ["تحتاج إلى متابعة", "Need follow-up"] },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.18em] text-violet-200/70"><WorkspaceText ar="مساحة العمل الإدارية" en="ADMIN WORKSPACE"/></p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl"><WorkspaceText ar="لوحة التحكم" en="Dashboard"/></h1>
          <p className="mt-2 text-sm text-white/45"><WorkspaceText ar="نظرة شاملة على نشاط NOVA وأحدث ما يحدث في منصتك." en="An overview of NOVA activity and the latest updates across your platform."/></p>
        </div>
        <Link href="/admin/projects" className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-200">
          <Plus size={16}/><WorkspaceText ar="متابعة الطلبات" en="Track requests"/>
        </Link>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <article key={label[0]} className="rounded-2xl border border-white/[.09] bg-gradient-to-br from-white/[.065] to-white/[.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,.12)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60"><WorkspaceText ar={label[0]} en={label[1]}/></span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><Icon size={19}/></span>
            </div>
            <p className="mt-5 text-4xl font-black tabular-nums">{value.toLocaleString("en-US")}</p>
            <p className="mt-2 text-xs text-white/35"><WorkspaceText ar={hint[0]} en={hint[1]}/></p>
          </article>
        ))}
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,.8fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-bold"><WorkspaceText ar="أحدث المشاريع والطلبات" en="Latest projects and requests"/></h2>
              <p className="mt-1 text-xs text-white/40"><WorkspaceText ar="آخر الطلبات المسجلة في قاعدة البيانات" en="Most recently submitted project requests"/></p>
            </div>
            <Link href="/admin/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-200 hover:text-violet-100"><WorkspaceText ar="عرض الكل" en="View all"/> <ArrowUpLeft size={14}/></Link>
          </div>
          {latestProjects.length ? (
            <div className="divide-y divide-white/[.07]">
              {latestProjects.map(project => (
                <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{project.name}</p>
                    <p className="mt-1 truncate text-xs text-white/40">{project.owner.name || project.owner.email} · {project.reference}</p>
                  </div>
                  <span className="rounded-full border border-violet-200/15 bg-violet-200/[.07] px-3 py-1.5 text-[11px] text-violet-100"><WorkspaceStatus status={project.status}/></span>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-white/40"><WorkspaceText ar="لا توجد مشاريع حتى الآن. ستظهر الطلبات الجديدة هنا." en="No projects yet. New requests will appear here."/></p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
          <h2 className="font-bold"><WorkspaceText ar="اختصارات الإدارة" en="Admin shortcuts"/></h2>
          <p className="mt-1 text-xs text-white/40"><WorkspaceText ar="انتقل مباشرة إلى الأقسام الأساسية" en="Jump to the main sections"/></p>
          <div className="mt-4 grid gap-2">
            <Link href="/admin/content" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Images size={17} className="text-violet-200"/><WorkspaceText ar="المحتوى ومعرض الأعمال" en="Content & portfolio"/></span><ArrowUpLeft size={15}/></Link>
            <Link href="/admin/customers" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Users size={17} className="text-violet-200"/><WorkspaceText ar="إدارة العملاء" en="Manage customers"/></span><ArrowUpLeft size={15}/></Link>
            <Link href="/admin/settings" className="flex items-center justify-between rounded-xl border border-white/[.07] p-3 text-sm text-white/75 transition hover:border-violet-200/30 hover:bg-violet-200/[.05]"><span className="flex items-center gap-3"><Settings size={17} className="text-violet-200"/><WorkspaceText ar="إعدادات الموقع" en="Site settings"/></span><ArrowUpLeft size={15}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
