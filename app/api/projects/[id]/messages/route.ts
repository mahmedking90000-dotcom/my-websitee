import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER", "SUPPORT_AGENT"];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: "سجّل الدخول لعرض المحادثة." }, { status: 401 });

  const { id } = await params;
  const isStaff = STAFF_ROLES.includes(String(session.user.role ?? ""));
  const project = await prisma.project.findFirst({
    where: { id, ...(isStaff ? {} : { ownerId: userId }) },
    select: { id: true }
  });

  if (!project) return NextResponse.json({ error: "المشروع غير موجود أو لا تملك صلاحية الوصول إليه." }, { status: 404 });

  // Opening a conversation marks messages from the other participant as read.
  await prisma.projectMessage.updateMany({
    where: { projectId: id, senderId: { not: userId }, isRead: false },
    data: { isRead: true }
  });

  const messages = await prisma.projectMessage.findMany({
    where: { projectId: id },
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 500
  });

  return NextResponse.json({ messages, currentUserId: userId });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: "سجّل الدخول لإرسال رسالة." }, { status: 401 });

  try {
    const parsed = z.object({ body: z.string().trim().min(1).max(5000) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اكتب رسالة من 1 إلى 5000 حرف." }, { status: 400 });

    const { id } = await params;
    const isStaff = STAFF_ROLES.includes(String(session.user.role ?? ""));
    const project = await prisma.project.findFirst({
      where: { id, ...(isStaff ? {} : { ownerId: userId }) },
      select: { id: true, ownerId: true, assigneeId: true, name: true }
    });

    if (!project) return NextResponse.json({ error: "المشروع غير موجود أو لا تملك صلاحية الوصول إليه." }, { status: 404 });

    const message = await prisma.projectMessage.create({
      data: { projectId: id, senderId: userId, body: parsed.data.body },
      include: { sender: { select: { name: true, role: true } } }
    });

    await prisma.project.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    let recipientIds: string[] = [];
    if (isStaff) {
      recipientIds = [project.ownerId];
    } else if (project.assigneeId) {
      recipientIds = [project.assigneeId];
    } else {
      const staff = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER", "SUPPORT_AGENT"] } },
        select: { id: true }
      });
      recipientIds = staff.map(user => user.id);
    }

    const notificationData = recipientIds
      .filter(recipientId => recipientId !== userId)
      .map(recipientId => ({
        userId: recipientId,
        type: "PROJECT_MESSAGE",
        title: { ar: "رسالة جديدة بخصوص مشروعك", en: "New project message" },
        body: { ar: parsed.data.body.slice(0, 180), en: parsed.data.body.slice(0, 180) },
        href: isStaff ? `/portal/projects/${id}` : `/admin/messages?projectId=${id}`
      }));

    if (notificationData.length) {
      await prisma.notification.createMany({ data: notificationData });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Project message error:", error);
    return NextResponse.json({ error: "تعذر إرسال الرسالة الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
