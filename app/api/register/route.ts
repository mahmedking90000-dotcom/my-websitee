import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { strongPasswordSchema } from "@/lib/password-policy";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  password: strongPasswordSchema
});

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function POST(req: Request) {
  try {
    const values = schema.parse(await req.json());
    const email = values.email.toLowerCase();

    // Match existing addresses without regard to letter case before attempting creation.
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد مسجل بالفعل. سجّل الدخول بدل إنشاء حساب جديد." },
        { status: 409 }
      );
    }

    await prisma.user.create({
      data: {
        name: values.name,
        email,
        phone: values.phone || null,
        passwordHash: await hash(values.password, 12)
      }
    });

    return NextResponse.json(
      {
        message: "تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.",
        email
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message;
      return NextResponse.json(
        { error: firstIssue || "راجع البيانات وكلمة المرور." },
        { status: 400 }
      );
    }
    // The unique database constraint is the final safeguard against concurrent duplicate sign-ups.
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "هذا البريد مسجل بالفعل. سجّل الدخول بدل إنشاء حساب جديد." },
        { status: 409 }
      );
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "تعذر إنشاء الحساب حاليًا." }, { status: 500 });
  }
}
