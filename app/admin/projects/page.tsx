import { prisma } from "@/lib/prisma";
import AdminProjectTracking from "@/components/admin-project-tracking";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  const projects = await prisma.project.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      updates: { orderBy: { createdAt: "desc" }, take: 8 }
    },
    orderBy: { createdAt: "desc" }
  });

  const initialProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    reference: project.reference,
    ownerName: project.owner.name,
    ownerEmail: project.owner.email,
    status: project.status,
    priority: project.priority,
    createdAt: project.createdAt.toISOString(),
    updates: project.updates.map(update => ({
      id: update.id,
      title: update.title,
      body: update.body,
      createdAt: update.createdAt.toISOString()
    }))
  }));

  return (
    <>
      <h1 className="text-3xl font-bold">إدارة ومتابعة المشاريع</h1>
      <p className="mt-2 text-sm text-white/45">حدّث مرحلة كل مشروع وأضف رسالة تظهر للعميل في سجل المتابعة الخاص به.</p>
      <AdminProjectTracking initialProjects={initialProjects} />
    </>
  );
}
