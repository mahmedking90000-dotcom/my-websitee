import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(10).max(128)
});

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]!);

export async function POST(req: Request) {
  try {
    const values = schema.parse(await req.json());
    const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD && process.env.SMTP_FROM;
    if (!smtpReady) {
      return NextResponse.json(
        { error: "التسجيل متوقف مؤقتًا حتى يتم إعداد خدمة إرسال البريد الإلكتروني." },
        { status: 503 }
      );
    }

    const email = values.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: existing.emailVerified ? "البريد مسجل بالفعل. سجّل الدخول." : "البريد مسجل بالفعل ولم يتم تأكيده. استخدم صفحة إعادة إرسال رابط التأكيد." },
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

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });

    const verifyUrl = new URL("/api/verify-email", process.env.AUTH_URL || new URL(req.url).origin);
    verifyUrl.searchParams.set("token", token);

    try {
      const nodemailer = (await import("nodemailer")).default;
      const port = Number(process.env.SMTP_PORT || 587);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "تأكيد البريد الإلكتروني - NOVA",
        text: `مرحبًا ${values.name}، لتأكيد بريدك الإلكتروني افتح الرابط التالي: ${verifyUrl.toString()}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>مرحبًا ${escapeHtml(values.name)}</h2><p>اضغط لتأكيد بريدك الإلكتروني:</p><p><a href="${verifyUrl.toString()}">تأكيد البريد الإلكتروني</a></p><p>صلاحية الرابط 24 ساعة.</p></div>`
      });
    } catch (error) {
      await prisma.emailVerificationToken.delete({ where: { tokenHash } }).catch(() => undefined);
      console.error("Registration verification email failed", error);
      return NextResponse.json(
        { error: "تم حفظ الحساب، لكن تعذر إرسال رسالة التأكيد. استخدم صفحة إعادة إرسال الرابط بعد قليل." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: "تم إنشاء الحساب. راجع بريدك الإلكتروني واضغط رابط التأكيد قبل تسجيل الدخول." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "راجع البيانات، ويجب أن تتكون كلمة المرور من 10 أحرف على الأقل." }, { status: 400 });
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "تعذر إنشاء الحساب حاليًا." }, { status: 500 });
  }
}
