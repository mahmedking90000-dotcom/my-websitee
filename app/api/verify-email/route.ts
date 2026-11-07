import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/verify-email", request.url));
}

export async function POST() {
  return NextResponse.json(
    { error: "تأكيد البريد الإلكتروني متوقف حاليًا. يمكنك تسجيل الدخول مباشرة." },
    { status: 410 }
  );
}
