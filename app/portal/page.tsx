import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function arabicText(value: unknown): string {
  if (value && typeof value === "object" && "ar" in value) {
    const localized = (value as { ar?: unknown }).ar;
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

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
      <h1 className="text-3xl font-bold">مرحبًا {session.user.name || "بك"}</h1>
      <p className="mt-2 text-white/50">تابع مشاريعك وطلباتك من مكان واحد.</p>
      <Link href="/portal/start-project" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-950">+ ابدأ مشروعًا جديدًا</Link>
      <h2 className="mt-10 text-xl font-bold">أحدث المشاريع</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {projects.map(project => (
          <Link key={project.id} href={"/portal/projects/" + project.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <b>{project.name}</b>
            <p className="mt-2 text-sm text-white/50">{project.reference} · {project.status}</p>
          </Link>
        ))}
        {!projects.length && <p className="text-white/50">لا توجد مشاريع بعد.</p>}
      </div>
      <h2 className="mt-10 text-xl font-bold">الإشعارات</h2>
      {notifications.map(notification => (
        <div key={notification.id} className="mt-3 rounded-xl border border-white/10 p-4">
          <b>{arabicText(notification.title)}</b>
          <p className="mt-1 text-sm text-white/50">{arabicText(notification.body)}</p>
        </div>
      ))}
    </>
  );
}
