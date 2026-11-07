import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedRoles = ["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER"];

const statusDetails: Record<string, { title: string; body: string }> = {
  NEW_REQUEST: { title: "تم استلام المشروع", body: "تم تسجيل طلب المشروع بنجاح." },
  UNDER_REVIEW: { title: "جاري مراجعة الطلب", body: "فريق NOVA يراجع تفاصيل ومتطلبات المشروع." },
  AWAITING_APPROVAL: { title: "تم التواصل معك", body: "تم تحديث مرحلة التواصل ومراجعة تفاصيل الاتفاق." },
  IN_PROGRESS: { title: "جاري بدء العمل", body: "تم الاتفاق والبدء في تنفيذ المشروع." },
  DESIGN_STAGE: { title: "مرحلة التصميم", body: "بدأ العمل على تصميم تجربة المشروع." },
  DEVELOPMENT_STAGE: { title: "مرحلة التطوير", body: "بدأت مرحلة تطوير وتنفيذ المشروع." },
  TESTING: { title: "الاختبار والمراجعة", body: "المشروع في مرحلة الاختبار ومراجعة التفاصيل." },
  COMPLETED: { title: "اكتمل المشروع", body: "تم الانتهاء من تنفيذ المشروع." },
  DELIVERED: { title: "تم التسليم", body: "تم تسليم المشروع." },
  CANCELLED: { title: "تم إلغاء المشروع", body: "تم إيقاف المشروع. يرجى التواصل مع فريق NOVA لمعرفة التفاصيل." }
};

const schema = z.object({
  status: z.enum([
    "NEW_REQUEST", "UNDER_REVIEW", "AWAITING_APPROVAL", "IN_PROGRESS",
    "DESIGN_STAGE", "DEVELOPMENT_STAGE", "TESTING", "COMPLETED",
    "DELIVERED", "CANCELLED"
  ]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  updateTitle: z.string().trim().min(1).max(160).optional(),
  updateBody: z.string().trim().min(1).max(5000).optional()
}).refine(data => Boolean(data.status || data.priority || (data.updateTitle && data.updateBody)), {
  message: "أدخل حالة جديدة أو تحديثًا كاملًا."
}).refine(data => Boolean(data.updateTitle) === Boolean(data.updateBody), {
  message: "عنوان التحديث وتفاصيله مطلوبان معًا."
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId || !allowedRoles.includes(String(session.user.role ?? ""))) {
    return NextResponse.json({ error: "غير مصرح لك بتحديث متابعة المشاريع." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "البيانات غير صحيحة. أدخل الحالة أو عنوان التحديث وتفاصيله." }, { status: 400 });
  }

  const { id } = await params;
  const data = parsed.data;
  const oldProject = await prisma.project.findUnique({
    where: { id },
    select: { id: true, ownerId: true, status: true }
  });
  if (!oldProject) return NextResponse.json({ error: "المشروع غير موجود." }, { status: 404 });

  const statusChanged = Boolean(data.status && data.status !== oldProject.status);
  const statusInfo = statusChanged && data.status ? statusDetails[data.status] : null;

  try {
    const project = await prisma.$transaction(async transaction => {
      const updatedProject = await transaction.project.update({
        where: { id },
        data: { status: data.status, priority: data.priority }
      });

      if (statusInfo) {
        await transaction.projectUpdate.create({
          data: {
            projectId: id,
            authorId: actorId,
            title: statusInfo.title,
            body: statusInfo.body,
            isInternal: false
          }
        });
      }

      if (data.updateTitle && data.updateBody) {
        await transaction.projectUpdate.create({
          data: {
            projectId: id,
            authorId: actorId,
            title: data.updateTitle,
            body: data.updateBody,
            isInternal: false
          }
        });
      }

      await transaction.auditLog.create({
        data: {
          actorId,
          action: "PROJECT_TRACKING_UPDATED",
          entityType: "Project",
          entityId: id,
          metadata: data
        }
      });

      return updatedProject;
    });

    if (statusInfo || data.updateTitle) {
      const title = data.updateTitle || statusInfo?.title || "تحديث متابعة المشروع";
      const body = data.updateBody || statusInfo?.body || title;
      await prisma.notification.create({
        data: {
          userId: oldProject.ownerId,
          type: "PROJECT_TRACKING",
          title: { ar: title, en: "Project tracking update" },
          body: { ar: body.slice(0, 180), en: body.slice(0, 180) },
          href: "/portal/projects/" + id
        }
      });
    }

    return NextResponse.json({ project, message: "تم تحديث متابعة المشروع." });
  } catch (error) {
    console.error("Project tracking update failed:", error);
    return NextResponse.json({ error: "تعذر حفظ التحديث الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
