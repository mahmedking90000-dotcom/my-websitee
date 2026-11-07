import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createEmailCode,
  EMAIL_CODE_TTL_MS,
  hashEmailCode,
  isSmtpConfigured,
  sendNOVAEmailCode
} from "@/lib/email-verification";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(10).max(128)
});

export async function POST(req: Request) {
  try {
    const values = schema.parse(await req.json());

    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { error: "خدمة إرسال البريد غير مُعدّة بعد. أضف إعدادات SMTP في Vercel لتفعيل التسجيل." },
        { status: 503 }
      );
    }

    const email = values.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: existing.emailVerified
            ? "البريد مسجل بالفعل. سجّل الدخول."
            : "البريد مسجل بالفعل ولم يتم تأكيده. افتح صفحة تأكيد البريد واطلب كودًا جديدًا."
        },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email,
        phone: values.phone || null,
        passwordHash: await hash(values.password, 12)
      }
    });

    const code = createEmailCode();
    const tokenHash = hashEmailCode(user.id, email, code);
    const tokenRow = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + EMAIL_CODE_TTL_MS)
      }
    });

    try {
      await sendNOVAEmailCode({ to: email, name: values.name, code });
    } catch (error) {
      await prisma.emailVerificationToken.delete({ where: { id: tokenRow.id } }).catch(() => undefined);
      console.error("Registration verification code email failed", error);
      return NextResponse.json(
        { error: "تعذر إرسال كود التأكيد الآن. حسابك لم يُفعّل؛ حاول إعادة إرسال الكود بعد ضبط خدمة البريد." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: "تم إنشاء الحساب وإرسال كود التأكيد إلى بريدك الإلكتروني.",
        email
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "راجع البيانات، ويجب أن تتكون كلمة المرور من 10 أحرف على الأقل." },
        { status: 400 }
      );
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "تعذر إنشاء الحساب حاليًا." }, { status: 500 });
  }
}
