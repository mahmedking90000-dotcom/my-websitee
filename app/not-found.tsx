import Link from "next/link";
import { ArrowUpLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main dir="rtl" className="site-shell grid min-h-screen place-items-center bg-[#080b14] px-6 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[.05] p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-white to-violet-300 text-slate-950"><Sparkles /></div>
        <p className="text-xs tracking-[.25em] text-violet-300">NOVA / 404</p>
        <h1 className="mt-4 text-5xl font-semibold">الصفحة غير موجودة</h1>
        <p className="mt-5 leading-8 text-white/55">يبدو أن الرابط غير صحيح أو أن الصفحة تم نقلها.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-slate-950">العودة للرئيسية <ArrowUpLeft size={17} /></Link>
      </div>
    </main>
  );
}
