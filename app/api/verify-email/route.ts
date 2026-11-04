import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/i);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!token || !tokenSchema.safeParse(token).success) {
    return NextResponse.redirect(new URL("/login?verify=invalid", requestUrl));
  }

  // Email security scanners commonly pre-open links. A GET must not consume the token.
  const confirmationUrl = new URL("/verify-email", requestUrl);
  confirmationUrl.searchParams.set("token", token);
  return NextResponse.redirect(confirmationUrl);
}

export async function POST(request: Request) {
  try {
    const { token } = z.object({ token: tokenSchema }).parse(await request.json());
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const row = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!row || row.usedAt || row.expiresAt <= new Date()) {
      return NextResponse.json({ error: "رابط التأكيد غير صالح أو انتهت صلاحيته." }, { status: 400 });
    }

    const now = new Date();
    const verified = await prisma.$transaction(async transaction => {
      const claimed = await transaction.emailVerificationToken.updateMany({
        where: { id: row.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now }
      });

      if (claimed.count !== 1) return false;

      await transaction.user.update({
        where: { id: row.userId },
        data: { emailVerified: now }
      });
      return true;
    });

    if (!verified) {
      return NextResponse.json({ error: "تم استخدام رابط التأكيد بالفعل أو انتهت صلاحيته." }, { status: 400 });
    }

    return NextResponse.json({ message: "تم تأكيد بريدك الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "رابط التأكيد غير صالح." }, { status: 400 });
    }
    console.error("Email verification failed", error);
    return NextResponse.json({ error: "تعذر تأكيد البريد الإلكتروني حاليًا." }, { status: 500 });
  }
}
