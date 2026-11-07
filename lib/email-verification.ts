import { createHmac, randomInt, randomBytes } from "node:crypto";

export const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
export const EMAIL_CODE_RESEND_WAIT_MS = 60 * 1000;
export const EMAIL_CODE_MAX_ATTEMPTS = 5;

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );
}

export function createEmailCode() {
  return String(randomInt(100_000, 1_000_000));
}

export function hashEmailCode(userId: string, email: string, code: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to hash email verification codes.");

  return createHmac("sha256", secret)
    .update(`NOVA_EMAIL_VERIFICATION:${userId}:${email.toLowerCase()}:${code}`)
    .digest("hex");
}

export function createFailedAttemptMarker() {
  return `failed:${randomBytes(32).toString("hex")}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]!);
}

export async function sendNOVAEmailCode({
  to,
  name,
  code
}: {
  to: string;
  name: string;
  code: string;
}) {
  if (!isSmtpConfigured()) throw new Error("SMTP is not configured.");

  const nodemailer = (await import("nodemailer")).default;
  const port = Number(process.env.SMTP_PORT || 587);
  const configuredFrom = process.env.SMTP_FROM!.trim();
  const addressMatch = configuredFrom.match(/<([^>]+)>/);
  const senderAddress = addressMatch?.[1]?.trim() || configuredFrom;
  const safeName = escapeHtml(name || "عميل NOVA");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: { name: "NOVA", address: senderAddress },
    to,
    subject: "كود تأكيد حسابك في NOVA",
    text:
      `مرحبًا ${name || "بك"}،\n\nكود تأكيد حسابك في NOVA هو: ${code}\n\nالكود صالح لمدة 10 دقائق فقط. لا تشاركه مع أي شخص.\nإذا لم تطلب إنشاء حساب، تجاهل هذه الرسالة.\n\nNOVA Digital Agency`,
    html: `
      <div dir="rtl" lang="ar" style="margin:0;padding:32px 12px;background:#f4f2fb;font-family:Arial,Helvetica,sans-serif;color:#201b35">
        <div style="max-width:520px;margin:0 auto;padding:32px 28px;background:#fff;border:1px solid #e8e2f5;border-radius:20px">
          <div style="font-size:22px;font-weight:800;letter-spacing:4px;color:#514080">NOVA<span style="color:#9b83ed">.</span></div>
          <p style="margin:28px 0 8px;font-size:18px;font-weight:700">أهلًا ${safeName}</p>
          <p style="margin:0;color:#68627a;line-height:1.9">شكرًا لإنشاء حسابك في NOVA. استخدم كود التأكيد التالي لتفعيل بريدك الإلكتروني:</p>
          <div style="margin:26px 0;padding:20px 12px;text-align:center;border:1px solid #e7e0fb;border-radius:16px;background:#f8f6ff">
            <div style="font-size:34px;font-weight:800;letter-spacing:10px;color:#493477;direction:ltr">${code}</div>
          </div>
          <p style="margin:0;color:#68627a;line-height:1.9">الكود صالح لمدة <strong>10 دقائق</strong> فقط.</p>
          <p style="margin:12px 0 0;color:#a33c55;font-size:13px;line-height:1.8">لأمان حسابك، لا تشارك هذا الكود مع أي شخص. فريق NOVA لن يطلبه منك.</p>
          <div style="margin-top:28px;padding-top:18px;border-top:1px solid #eeeaf5;color:#9992aa;font-size:12px">NOVA Digital Agency · رسالة آلية، يُرجى عدم الرد عليها.</div>
        </div>
      </div>
    `
  });
}
