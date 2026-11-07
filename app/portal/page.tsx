import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkspaceStatus, WorkspaceText, WorkspaceValue } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Portal() {
  const session = await auth();
  if (!session?.user || !("id" in session.user) || typeof session.user.id !== "string") {
    redirect("/login?callbackUrl=%2Fportal");
  }

  const userId = session.user.id;
  const [projects, notifications] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold"><WorkspaceText ar="مرحبًا" en="Welcome"/> {session.user.name || ""}</h1>
      <p className="mt-2 text-white/50"><WorkspaceText ar="تابع مشاريعك وطلباتك من مكان واحد." en="Track your projects and requests in one place."/></p>
      <Link href="/portal/start-project" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-950">
        + <WorkspaceText ar="ابدأ مشروعًا جديدًا" en="Start a new project"/>
      </Link>
      <h2 className="mt-10 text-xl font-bold"><WorkspaceText ar="أحدث المشاريع" en="Latest projects"/></h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {projects.map(project => (
          <Link key={project.id} href={"/portal/projects/" + project.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <b>{project.name}</b>
            <p className="mt-2 text-sm text-white/50">{project.reference} · <WorkspaceStatus status={project.status}/></p>
          </Link>
        ))}
        {!projects.length && <p className="text-white/50"><WorkspaceText ar="لا توجد مشاريع بعد." en="No projects yet."/></p>}
      </div>
      <h2 className="mt-10 text-xl font-bold"><WorkspaceText ar="الإشعارات" en="Notifications"/></h2>
      {notifications.map(notification => (
        <div key={notification.id} className="mt-3 rounded-xl border border-white/10 p-4">
          <b><WorkspaceValue value={notification.title}/></b>
          <p className="mt-1 text-sm text-white/50"><WorkspaceValue value={notification.body}/></p>
        </div>
      ))}
    </>
  );
}
