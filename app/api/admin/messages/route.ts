import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER", "SUPPORT_AGENT"];

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || !STAFF_ROLES.includes(String(session.user.role ?? ""))) {
    return NextResponse.json({ error: "غير مصرح." }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    where: { messages: { some: {} } },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  const projectIds = projects.map(project => project.id);
  const unreadRows = projectIds.length
    ? await prisma.projectMessage.findMany({
        where: { projectId: { in: projectIds }, isRead: false },
        select: { projectId: true, senderId: true }
      })
    : [];

  const ownerByProject = new Map<string, string>(
    projects.map(project => [project.id, project.owner.id] as const)
  );
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

  return NextResponse.json({ conversations });
}
