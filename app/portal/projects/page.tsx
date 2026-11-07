import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceStatus, WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Projects() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string") {
    redirect("/login?callbackUrl=%2Fportal%2Fprojects");
  }

  const items = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <h1 className="text-3xl font-bold"><WorkspaceText ar="مشاريعي" en="My projects"/></h1>
      <div className="mt-6 grid gap-3">
        {items.map(project => (
          <Link key={project.id} href={"/portal/projects/" + project.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex justify-between gap-3">
              <b>{project.name}</b>
              <WorkspaceStatus status={project.status} className="text-violet-200"/>
            </div>
            <p className="mt-2 text-sm text-white/50">{project.reference}</p>
          </Link>
        ))}
        {!items.length && <p className="text-white/50"><WorkspaceText ar="لم ترسل أي طلب مشروع بعد." en="You have not submitted a project request yet."/></p>}
      </div>
    </>
  );
}
