import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createFailedAttemptMarker,
  EMAIL_CODE_MAX_ATTEMPTS,
  hashEmailCode
} from "@/lib/email-verification";

const codeSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/)
});

const legacyTokenSchema = z.string().regex(/^[a-f0-9]{64}$/i);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  if (token && legacyTokenSchema.safeParse(token).success) {
    const confirmationUrl = new URL("/verify-email", requestUrl);
    confirmationUrl.searchParams.set("token", token);
    return NextResponse.redirect(confirmationUrl);
  }
  return NextResponse.redirect(new URL("/verify-email", requestUrl));
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Support old, unexpired links already sent before the code-based flow.
    if (payload && typeof payload === "object" && "token" in payload) {
      const { token } = z.object({ token: legacyTokenSchema }).parse(payload);
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
        await transaction.user.update({ where: { id: row.userId }, data: { emailVerified: now } });
        return true;
      });
      if (!verified) {
        return NextResponse.json({ error: "تم استخدام رابط التأكيد بالفعل أو انتهت صلاحيته." }, { status: 400 });
      }
      await prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } });
      return NextResponse.json({ message: "تم تأكيد بريدك الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن." });
    }

    const { email: rawEmail, code } = codeSchema.parse(payload);
    const email = rawEmail.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "البريد أو كود التأكيد غير صحيح." }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "تم تأكيد بريدك الإلكتروني بالفعل. يمكنك تسجيل الدخول الآن." });
    }

    const windowStart = new Date(Date.now() - 10 * 60 * 1000);
    const failedAttempts = await prisma.emailVerificationToken.count({
      where: {
        userId: user.id,
        tokenHash: { startsWith: "failed:" },
        createdAt: { gt: windowStart }
      }
    });
    if (failedAttempts >= EMAIL_CODE_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "تم تجاوز عدد المحاولات. اطلب كودًا جديدًا بعد 10 دقائق." },
        { status: 429 }
      );
    }

    const tokenHash = hashEmailCode(user.id, email, code);
    const row = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
    const now = new Date();

    if (!row || row.userId !== user.id || row.usedAt || row.expiresAt <= now) {
      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: createFailedAttemptMarker(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });
      return NextResponse.json({ error: "كود التأكيد غير صحيح أو انتهت صلاحيته." }, { status: 400 });
    }

    const verified = await prisma.$transaction(async transaction => {
      const claimed = await transaction.emailVerificationToken.updateMany({
        where: { id: row.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now }
      });
      if (claimed.count !== 1) return false;
      await transaction.user.update({ where: { id: user.id }, data: { emailVerified: now } });
      return true;
    });

    if (!verified) {
      return NextResponse.json({ error: "تم استخدام الكود بالفعل أو انتهت صلاحيته." }, { status: 400 });
    }

    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ message: "تم تأكيد بريدك الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "أدخل البريد الإلكتروني وكود التأكيد المكوّن من 6 أرقام." }, { status: 400 });
    }
    console.error("Email verification failed", error);
    return NextResponse.json({ error: "تعذر تأكيد البريد الإلكتروني حاليًا." }, { status: 500 });
  }
}
