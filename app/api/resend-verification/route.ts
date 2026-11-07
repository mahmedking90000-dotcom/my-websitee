import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createEmailCode,
  EMAIL_CODE_MAX_ATTEMPTS,
  EMAIL_CODE_RESEND_WAIT_MS,
  EMAIL_CODE_TTL_MS,
  hashEmailCode,
  isSmtpConfigured,
  sendNOVAEmailCode
} from "@/lib/email-verification";

const schema = z.object({ email: z.string().trim().email() });

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = schema.parse(await req.json());
    const email = rawEmail.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    const message = "إذا كان الحساب موجودًا ولم يتم تأكيده، فسيصلك كود تأكيد جديد.";
    if (!user || user.emailVerified) return NextResponse.json({ message });

    if (!isSmtpConfigured()) {
      return NextResponse.json({ error: "خدمة إرسال البريد غير مُعدّة بعد. أضف إعدادات SMTP في Vercel." }, { status: 503 });
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - 10 * 60 * 1000);
    const failedAttempts = await prisma.emailVerificationToken.count({
      where: {
        userId: user.id,
        tokenHash: { startsWith: "failed:" },
        createdAt: { gt: windowStart }
      }
    });
    if (failedAttempts >= EMAIL_CODE_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "تم تجاوز عدد المحاولات. حاول مجددًا بعد 10 دقائق." }, { status: 429 });
    }

    const rows = await prisma.emailVerificationToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    const latestCode = rows.find(row => !row.tokenHash.startsWith("failed:"));
    if (latestCode && latestCode.createdAt.getTime() > now.getTime() - EMAIL_CODE_RESEND_WAIT_MS) {
      return NextResponse.json({ error: "انتظر دقيقة قبل طلب كود جديد." }, { status: 429 });
    }

    const code = createEmailCode();
    const tokenHash = hashEmailCode(user.id, email, code);
    const newRow = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(now.getTime() + EMAIL_CODE_TTL_MS)
      }
    });

    try {
      await sendNOVAEmailCode({ to: email, name: user.name || "", code });
    } catch (error) {
      await prisma.emailVerificationToken.delete({ where: { id: newRow.id } }).catch(() => undefined);
      console.error("Verification code delivery failed", error);
      return NextResponse.json({ error: "تعذر إرسال كود التأكيد الآن. حاول مرة أخرى لاحقًا." }, { status: 502 });
    }

    const previousCodes = rows.filter(row => !row.tokenHash.startsWith("failed:"));
    await Promise.all(previousCodes.map(row =>
      prisma.emailVerificationToken.delete({ where: { id: row.id } }).catch(() => undefined)
    ));

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "اكتب بريدًا إلكترونيًا صحيحًا." }, { status: 400 });
    }
    console.error("Resend verification code failed", error);
    return NextResponse.json({ error: "حدث خطأ أثناء طلب كود التأكيد." }, { status: 500 });
  }
}
