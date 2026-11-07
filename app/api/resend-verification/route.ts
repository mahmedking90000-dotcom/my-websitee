import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "إعادة إرسال كود التأكيد متوقفة حاليًا." },
    { status: 410 }
  );
}
