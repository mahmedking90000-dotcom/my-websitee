import { prisma } from "@/lib/prisma";
import { WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Audit() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return (
    <>
      <h1 className="text-3xl font-bold"><WorkspaceText ar="سجل العمليات" en="Activity log"/></h1>
      <div className="mt-6 space-y-3">
        {logs.map(item => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b>{item.action}</b>
            <p className="mt-1 text-sm text-white/50">{item.actor?.email || "System"} · {item.entityType} · {item.createdAt.toLocaleString("en-US")}</p>
          </div>
        ))}
        {!logs.length && <p className="text-white/50"><WorkspaceText ar="لا توجد عمليات مسجلة بعد." en="No activity has been recorded yet."/></p>}
      </div>
    </>
  );
}
