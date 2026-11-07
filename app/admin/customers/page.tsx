import { prisma } from "@/lib/prisma";
import { WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Customers() {
  const users = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { _count: { select: { ownedProjects: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <h1 className="text-3xl font-bold"><WorkspaceText ar="العملاء" en="Customers"/></h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-start text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4"><WorkspaceText ar="الاسم" en="Name"/></th>
              <th className="p-4"><WorkspaceText ar="البريد" en="Email"/></th>
              <th className="p-4"><WorkspaceText ar="الهاتف" en="Phone"/></th>
              <th className="p-4"><WorkspaceText ar="المشاريع" en="Projects"/></th>
              <th className="p-4"><WorkspaceText ar="تاريخ التسجيل" en="Registration date"/></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.phone || "—"}</td>
                <td className="p-4">{user._count.ownedProjects}</td>
                <td className="p-4">{user.createdAt.toLocaleDateString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="p-6 text-white/50"><WorkspaceText ar="لا يوجد عملاء بعد." en="No customers yet."/></p>}
      </div>
    </>
  );
}
