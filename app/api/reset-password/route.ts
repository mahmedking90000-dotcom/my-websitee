import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z.string().min(10).max(128)
});

export async function POST(request: Request) {
  try {
    const { token, password } = schema.parse(await request.json());
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!row || row.usedAt || row.expiresAt <= new Date()) {
      return NextResponse.json({ error: "الرابط غير صالح أو انتهت صلاحيته." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const now = new Date();

    const updated = await prisma.$transaction(async transaction => {
      const claimed = await transaction.passwordResetToken.updateMany({
        where: { id: row.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now }
      });

      if (claimed.count !== 1) return false;

      await transaction.user.update({
        where: { id: row.userId },
        data: { passwordHash }
      });

      // Retain cleanup for any adapter-backed sessions if the strategy changes.
      await transaction.session.deleteMany({ where: { userId: row.userId } });
      return true;
    });

    if (!updated) {
      return NextResponse.json({ error: "تم استخدام رابط الاستعادة بالفعل أو انتهت صلاحيته." }, { status: 400 });
    }

    return NextResponse.json({ message: "تم تغيير كلمة المرور. سجّل الدخول مرة أخرى." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "الرابط غير صالح أو كلمة المرور لا تستوفي الشروط." }, { status: 400 });
    }
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "تعذر تغيير كلمة المرور حاليًا." }, { status: 500 });
  }
}
