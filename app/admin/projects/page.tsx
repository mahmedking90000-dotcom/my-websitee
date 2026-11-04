import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminProjectManager from "@/components/admin-project-manager";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function AdminProjects() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as {role?:string}).role;
  const canManage = ["ADMIN","SUPER_ADMIN","PROJECT_MANAGER"].includes(role ?? "");
  const projects = await prisma.project.findMany({
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <div className="mx-auto max-w-6xl">
    <div><p className="text-xs font-bold tracking-[.18em] text-violet-200/70">إدارة العمليات</p><h1 className="mt-2 text-3xl font-black">إدارة المشاريع والطلبات</h1><p className="mt-2 text-sm text-white/45">راجع طلبات العملاء، حدّث حالة التنفيذ والأولوية، وأرسل تحديثات مباشرة إلى العميل.</p></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-white/45">إجمالي المشاريع</p><p className="mt-2 text-2xl font-black">{projects.length}</p></div>
      <div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-white/45">طلبات جديدة</p><p className="mt-2 text-2xl font-black">{projects.filter(p=>p.status==="NEW_REQUEST").length}</p></div>
      <div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-white/45">قيد التنفيذ</p><p className="mt-2 text-2xl font-black">{projects.filter(p=>["IN_PROGRESS","DESIGN_STAGE","DEVELOPMENT_STAGE","TESTING"].includes(p.status)).length}</p></div>
    </div>
    <AdminProjectManager canManage={canManage} projects={projects.map(p=>({...p,createdAt:p.createdAt.toISOString()}))}/>
  </div>;
}
