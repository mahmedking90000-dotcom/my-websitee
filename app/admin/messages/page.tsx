import { prisma } from "@/lib/prisma";
import AdminMessageCenter from "@/components/admin-message-center";

export const dynamic = "force-dynamic";

export default async function Messages() {
  const [contacts, chats, projects] = await Promise.all([
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.chatConversation.findMany({
      include: { user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: "desc" }, take: 2 } },
      orderBy: { updatedAt: "desc" },
      take: 50
    }),
    prisma.project.findMany({
      where: { messages: { some: {} } },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { name: true } } } }
      },
      orderBy: { updatedAt: "desc" },
      take: 100
    })
  ]);

  const projectIds = projects.map(project => project.id);
  const unreadRows = projectIds.length
    ? await prisma.projectMessage.findMany({
        where: { projectId: { in: projectIds }, isRead: false },
        select: { projectId: true, senderId: true }
      })
    : [];
  const ownerByProject = new Map(projects.map(project => [project.id, project.owner.id]));
  const unreadByProject = new Map<string, number>();
  for (const message of unreadRows) {
    if (ownerByProject.get(message.projectId) === message.senderId) {
      unreadByProject.set(message.projectId, (unreadByProject.get(message.projectId) ?? 0) + 1);
    }
  }

  const conversations = projects.map(project => {
    const latest = project.messages[0];
    return {
      id: project.id,
      name: project.name,
      reference: project.reference,
      ownerName: project.owner.name ?? "عميل",
      ownerEmail: project.owner.email,
      latestMessage: latest ? {
        body: latest.body,
        senderName: latest.sender.name ?? "مستخدم",
        createdAt: latest.createdAt.toISOString()
      } : null,
      unreadCount: unreadByProject.get(project.id) ?? 0
    };
  });

  return (
    <>
      <h1 className="text-3xl font-bold">الرسائل والاستفسارات</h1>
      <h2 className="mt-8 text-xl font-bold">مراسلة العملاء مباشرة</h2>
      <p className="mt-2 text-sm text-white/45">محادثة مستقلة لكل مشروع بين العميل وفريق NOVA.</p>
      <AdminMessageCenter conversations={conversations} />

      <h2 className="mt-10 text-xl font-bold">طلبات التواصل ({contacts.length})</h2>
      <div className="mt-3 space-y-3">
        {contacts.map(item => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex justify-between gap-3">
              <b>{item.name} · {item.subject || "استفسار"}</b>
              <span className="text-xs text-white/40">{item.createdAt.toLocaleString("ar-EG")}</span>
            </div>
            <p className="mt-2 text-sm text-white/60">{item.email} {item.phone || ""}</p>
            <p className="mt-3 leading-7">{item.message}</p>
          </article>
        ))}
        {!contacts.length && <p className="text-white/50">لا توجد استفسارات.</p>}
      </div>

      <h2 className="mt-10 text-xl font-bold">محادثات المساعد ({chats.length})</h2>
      <div className="mt-3 space-y-3">
        {chats.map(conversation => (
          <article key={conversation.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <b>{conversation.user?.name || "زائر"} · {conversation.user?.email || "بدون حساب"}</b>
            {conversation.messages.map(message => (
              <p key={message.id} className="mt-2 text-sm text-white/60">{message.role}: {message.content}</p>
            ))}
          </article>
        ))}
        {!chats.length && <p className="text-white/50">لا توجد محادثات محفوظة.</p>}
      </div>
    </>
  );
}
