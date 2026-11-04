import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = schema.parse(await req.json());
    const email = rawEmail.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Keep the response identical for unknown, already verified, and eligible accounts.
    const message = "إذا كان الحساب موجودًا ولم يتم تأكيده، فستصلك رسالة تحقق جديدة.";
    if (!user || user.emailVerified) return NextResponse.json({ message });

    const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD && process.env.SMTP_FROM;
    if (!smtpReady) {
      return NextResponse.json({ error: "إرسال البريد غير مُعد بعد. يلزم إضافة إعدادات SMTP في Vercel." }, { status: 503 });
    }

    const recent = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: "desc" }
    });
    if (recent) {
      return NextResponse.json({ error: "انتظر دقيقة قبل طلب رسالة أخرى." }, { status: 429 });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const tokenRow = await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });

    const baseUrl = process.env.AUTH_URL || new URL(req.url).origin;
    const verifyUrl = new URL("/api/verify-email", baseUrl);
    verifyUrl.searchParams.set("token", token);
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]!);

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
        subject: "تأكيد البريد الإلكتروني - NOVA",
        text: `مرحبًا ${user.name || ""}، أكد بريدك الإلكتروني من خلال الرابط: ${verifyUrl.toString()}`,
        html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>مرحبًا ${escapeHtml(user.name || "")}</h2><p>اضغط على الرابط التالي لتأكيد بريدك الإلكتروني:</p><p><a href="${verifyUrl.toString()}">تأكيد البريد الإلكتروني</a></p><p>صلاحية الرابط 24 ساعة.</p></div>`
      });
      await prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id, id: { not: tokenRow.id } }
      });
    } catch (error) {
      await prisma.emailVerificationToken.delete({ where: { id: tokenRow.id } }).catch(() => undefined);
      console.error("Verification email delivery failed", error);
      return NextResponse.json({ error: "تعذر إرسال الرسالة حاليًا. حاول مرة أخرى لاحقًا." }, { status: 502 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "اكتب بريدًا إلكترونيًا صحيحًا." }, { status: 400 });
    }
    console.error("Resend verification failed", error);
    return NextResponse.json({ error: "حدث خطأ أثناء طلب رسالة التحقق." }, { status: 500 });
  }
}
