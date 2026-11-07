import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ProjectChat from "@/components/project-chat";
import ProjectTracking from "@/components/project-tracking";

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

      <ProjectTracking
        status={project.status}
        createdAt={project.createdAt}
        updates={project.updates}
      />

      <ProjectChat projectId={project.id} />
    </>
  );
}
