import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BriefcaseBusiness, Users, Images, MessageSquare, Settings, ClipboardList, ExternalLink, ShieldCheck } from "lucide-react";
import SignOutButton from "@/components/signout-button";

const navigation = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/projects", label: "إدارة المشاريع", icon: BriefcaseBusiness },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/content", label: "المحتوى ومعرض الأعمال", icon: Images },
  { href: "/admin/messages", label: "الرسائل", icon: MessageSquare },
  { href: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
  { href: "/admin/audit", label: "سجل العمليات", icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER", "SUPPORT_AGENT"].includes(role ?? "")) redirect("/portal");

  return (
    <div dir="rtl" className="site-shell min-h-screen bg-[#070a12] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090d18]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/15 text-violet-200"><ShieldCheck size={21}/></span>
            <span><span className="block text-sm font-black tracking-[.22em]">NOVA</span><span className="text-[11px] text-white/45">ADMIN WORKSPACE</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/65 transition hover:bg-white/5 sm:flex">عرض الموقع <ExternalLink size={14}/></Link>
            <div className="hidden text-left sm:block"><p className="text-xs font-semibold">{session.user.name ?? "مدير الموقع"}</p><p className="text-[10px] text-violet-200/70">مدير النظام</p></div>
            <SignOutButton/>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#0a0e19] p-3 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:border-b-0 lg:border-l lg:p-5">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[.18em] text-white/35">القائمة الرئيسية</p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigation.map(({ href, label, icon: Icon }, index) => (
              <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-white/[.07] hover:text-white ${index === 0 ? "bg-violet-400/10 font-bold text-violet-100 ring-1 ring-violet-300/15" : "text-white/60"}`}>
                <Icon size={17}/><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl border border-violet-300/15 bg-violet-300/[.06] p-4 lg:block">
            <p className="text-xs font-bold text-violet-100">مساحة إدارة NOVA</p>
            <p className="mt-2 text-[11px] leading-6 text-white/45">تابع العملاء والطلبات والمشروعات ومحتوى الموقع من مكان واحد.</p>
          </div>
        </aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
