import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string") {
    redirect("/login?callbackUrl=" + encodeURIComponent("/portal/projects/" + id));
  }

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      updates: {
        where: { isInternal: false },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) notFound();

  return (
    <>
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="mt-2 text-white/50">{project.reference} · {project.status}</p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-bold">تفاصيل المشروع</h2>
        <p className="mt-3 leading-8 text-white/70">{project.description}</p>
        <p className="mt-3 text-sm text-white/50">نوع المشروع: {project.type}</p>
      </div>
      <h2 className="mt-8 text-xl font-bold">التحديثات</h2>
      <div className="mt-3 space-y-3">
        {project.updates.map(update => (
          <div key={update.id} className="rounded-xl border border-white/10 p-4">
            <b>{update.title}</b>
            <p className="mt-2 text-white/60">{update.body}</p>
          </div>
        ))}
        {!project.updates.length && <p className="text-white/50">لا توجد تحديثات بعد.</p>}
      </div>
    </>
  );
}
