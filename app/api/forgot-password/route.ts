import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const mailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);

export async function POST(request: Request) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(await request.json());

    // Check mail readiness before looking up the account. This keeps the response
    // independent of whether an email address exists when mail is unavailable.
    if (!mailConfigured()) {
      return NextResponse.json({ error: "خدمة البريد غير متاحة مؤقتًا. حاول لاحقًا." }, { status: 503 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ message: "إذا كان البريد مسجلًا فستصلك رسالة الاستعادة." });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const tokenRow = await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) }
    });

    const resetUrl = new URL("/reset-password", process.env.AUTH_URL || new URL(request.url).origin);
    resetUrl.searchParams.set("token", token);

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
        to: user.email,
        subject: "إعادة تعيين كلمة مرور NOVA",
        text: "استخدم الرابط التالي لإعادة تعيين كلمة مرورك خلال 30 دقيقة: " + resetUrl.toString(),
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><p>لإعادة تعيين كلمة مرورك، افتح الرابط التالي خلال 30 دقيقة:</p><p><a href="${resetUrl.toString()}">إعادة تعيين كلمة المرور</a></p></div>`
      });
    } catch (error) {
      await prisma.passwordResetToken.delete({ where: { id: tokenRow.id } }).catch(() => undefined);
      console.error("Password reset email delivery failed", error);
      return NextResponse.json({ error: "تعذر إرسال رسالة الاستعادة حاليًا. حاول لاحقًا." }, { status: 502 });
    }

    return NextResponse.json({ message: "إذا كان البريد مسجلًا فستصلك رسالة الاستعادة." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "اكتب بريدًا إلكترونيًا صحيحًا." }, { status: 400 });
    }
    console.error("Password reset request failed", error);
    return NextResponse.json({ error: "تعذر إرسال رسالة الاستعادة." }, { status: 500 });
  }
}
