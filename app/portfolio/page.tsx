import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const concepts = [
  { key: "concept-luma", title: "Luma — هوية وتجربة علامة", description: "تصور إبداعي لهوية رقمية معاصرة.", style: "from-fuchsia-500/30 via-violet-900/60 to-slate-950" },
  { key: "concept-north", title: "North — موقع معماري", description: "تصور لواجهة مكتب معماري ومساحة أعمال.", style: "from-cyan-400/25 via-blue-900/60 to-slate-950" },
  { key: "concept-forma", title: "Forma — متجر إلكتروني", description: "تصور لتجربة متجر إلكتروني وعرض منتجات.", style: "from-amber-300/25 via-rose-900/50 to-slate-950" }
] as const;

function arabicText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "ar" in value) {
    const localized = (value as { ar?: unknown }).ar;
    return typeof localized === "string" ? localized : "";
  }
  return "";
}

export default async function Portfolio() {
  const items = await prisma.portfolioProject.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <main dir="rtl" className="site-shell min-h-screen bg-[#080b14] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[.25em] text-violet-300">SELECTED WORK</p>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">معرض الأعمال</h1>
            <p className="mt-3 text-white/55">نماذج تصورية وأعمال منشورة توضح أسلوبنا الإبداعي في التصميم والتطوير.</p>
          </div>
          <Link href="/start-project" className="rounded-full bg-white px-6 py-3 font-bold text-slate-950">ابدأ مشروعك</Link>
        </div>

        {items.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(project => {
              const title = arabicText(project.title) || project.slug;
              const summary = arabicText(project.summary);
              const video = project.galleryKeys.find(value => value.startsWith("video:"))?.slice(6);
              return (
                <article key={project.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.045]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                    {video ? (
                      <video controls preload="metadata" poster={project.coverImageKey || undefined} className="h-full w-full object-cover">
                        <source src={video} type="video/mp4" />
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                    ) : project.coverImageKey ? (
                      <img src={project.coverImageKey} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-5xl">✦</div>
                    )}
                    <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs text-white">
                      {project.slug.startsWith("demo-") ? "نموذج تجريبي" : video ? "فيديو" : "مشروع"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/55">{summary}</p>
                    {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-violet-200">معاينة المشروع ↗</a>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((concept, index) => (
              <article key={concept.key} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.045]">
                <div className={"relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br " + concept.style}>
                  <div className="absolute inset-5 rounded-[1.5rem] border border-white/15" />
                  <div className="h-36 w-36 rotate-[-12deg] rounded-[2rem] border border-white/40 bg-white/10 shadow-2xl backdrop-blur-xl" />
                  <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs">نموذج تصوري</span>
                  <span className="absolute bottom-5 left-5 text-[10px] tracking-[.25em] text-white/55">NOVA CONCEPT 0{index + 1}</span>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold">{concept.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/55">{concept.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-16 border-t border-white/10 py-6 text-xs text-white/40">© 2026 NOVA. جميع الحقوق محفوظة.</footer>
      </div>
    </main>
  );
}
