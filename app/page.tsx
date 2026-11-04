import { ArrowDownLeft, ArrowUpLeft, Aperture, Layers3, Sparkles, Code2, Clapperboard, PenTool, MoveUpLeft, Menu } from "lucide-react";

const services = [
  { icon: Aperture, title: "الهوية البصرية", desc: "نبني علامة واضحة ومميزة تعكس شخصية مشروعك وتترك انطباعًا لا يُنسى." },
  { icon: Code2, title: "تصميم وتطوير المواقع", desc: "مواقع سريعة وعصرية، بتجربة استخدام سلسة وتفاصيل تهتم بكل شاشة." },
  { icon: Clapperboard, title: "الموشن والفيديو", desc: "نحوّل رسالتك إلى محتوى بصري متحرك يجذب الانتباه ويحكي قصتك." },
  { icon: Layers3, title: "التسويق الرقمي", desc: "استراتيجيات ومحتوى يساعدانك على الوصول للجمهور المناسب." }
];

const projects = [
  { no: "01", type: "Brand Identity", name: "Luma Skincare", tone: "from-fuchsia-500/35 via-violet-500/20 to-transparent" },
  { no: "02", type: "Digital Experience", name: "North Architecture", tone: "from-cyan-400/30 via-blue-500/20 to-transparent" },
  { no: "03", type: "Campaign & Motion", name: "Forma Studio", tone: "from-amber-400/30 via-rose-500/20 to-transparent" }
];

const plans = [
  { name: "Starter", price: "حسب احتياجك", desc: "للمشروعات الناشئة", items: ["صفحة تعريفية احترافية", "تصميم متجاوب", "تهيئة أساسية لمحركات البحث"] },
  { name: "Growth", price: "حسب نطاق المشروع", desc: "للشركات التي تريد التوسع", featured: true, items: ["موقع متعدد الصفحات", "هوية وتجربة مستخدم", "تكاملات ونماذج تواصل", "دعم بعد التسليم"] },
  { name: "Custom", price: "عرض مخصص", desc: "للحلول المصممة خصيصًا", items: ["منصات ولوحات تحكم", "خصائص حسب الطلب", "تكامل قواعد البيانات", "متابعة وتطوير مستمر"] }
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <div className="grid-glow pointer-events-none fixed inset-0 -z-0 opacity-70" />
      <header className="container relative z-10 flex items-center justify-between py-6">
        <a href="#" className="flex items-center gap-3" aria-label="NOVA home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-950"><Sparkles size={21} /></span>
          <span className="text-xl font-semibold tracking-[.22em]">NOVA</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
          <a href="#services" className="transition hover:text-white">خدماتنا</a>
          <a href="#work" className="transition hover:text-white">أعمالنا</a>
          <a href="#process" className="transition hover:text-white">كيف نعمل</a>
          <a href="#pricing" className="transition hover:text-white">الباقات</a>
        </nav>
        <a href="#contact" className="hidden rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-slate-950 md:inline-flex">ابدأ مشروعك <ArrowUpLeft className="mr-2" size={16} /></a>
        <button className="rounded-xl border border-white/15 p-2 md:hidden" aria-label="فتح القائمة"><Menu /></button>
      </header>

      <section className="container relative z-10 grid min-h-[690px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-4 py-2 text-xs text-white/70"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_#6ee7b7]" /> وكالة رقمية تصنع التجربة القادمة</div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.25] tracking-tight sm:text-6xl lg:text-7xl">أفكارك تستحق<br /><span className="gradient-text">حضورًا استثنائيًا.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-9 text-white/55">نصمم ونطوّر تجارب رقمية وهوية بصرية ومحتوى إبداعيًا يساعد علامتك التجارية على النمو والتميّز.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#contact" className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-slate-950 transition hover:-translate-y-1">خلينا نبدأ <ArrowUpLeft size={18} /></a>
            <a href="#work" className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-white/80 transition hover:bg-white/10">شاهد أعمالنا <MoveUpLeft size={17} /></a>
          </div>
          <div className="mt-16 flex gap-10 border-t border-white/10 pt-7">
            <div><div className="text-3xl font-semibold">360°</div><div className="mt-1 text-xs text-white/45">رؤية متكاملة</div></div>
            <div><div className="text-3xl font-semibold">∞</div><div className="mt-1 text-xs text-white/45">أفكار بلا حدود</div></div>
            <div><div className="text-3xl font-semibold">01</div><div className="mt-1 text-xs text-white/45">شريكك الإبداعي</div></div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute inset-10 rounded-full bg-violet-500/20 blur-[90px]" />
          <div className="glass relative aspect-square overflow-hidden rounded-[2.5rem] p-5">
            <div className="absolute inset-5 rounded-[2rem] border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
            <div className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2.7rem] bg-gradient-to-br from-violet-300 via-indigo-500 to-cyan-300 shadow-[0_20px_100px_rgba(139,92,246,.35)] rotate-[-12deg]"><Sparkles size={76} strokeWidth={1} /></div>
            <div className="glass absolute right-7 top-9 rounded-2xl px-4 py-3 text-xs text-white/75">DESIGN <span className="text-violet-300">✳</span> CREATE</div>
            <div className="glass absolute bottom-8 left-7 rounded-2xl px-4 py-3 text-xs text-white/75">DIGITAL CRAFT</div>
            <div className="absolute bottom-8 right-8 text-[10px] tracking-[.35em] text-white/35">N / 2026</div>
          </div>
        </div>
      </section>

      <section id="services" className="container relative z-10 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs tracking-[.3em] text-violet-300">WHAT WE DO</p><h2 className="text-4xl font-semibold sm:text-5xl">كل ما تحتاجه <span className="gradient-text">لتكبر.</span></h2></div><p className="max-w-sm text-sm leading-7 text-white/45">من أول فكرة إلى إطلاق مشروعك، نجمع الاستراتيجية والإبداع والتقنية في مكان واحد.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, desc }, i) => <article key={title} className="glass group rounded-3xl p-7 transition duration-300 hover:-translate-y-2 hover:border-violet-300/40"><div className="mb-12 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-200"><Icon /></span><span className="text-xs text-white/30">0{i + 1}</span></div><h3 className="mb-3 text-xl font-semibold">{title}</h3><p className="text-sm leading-7 text-white/50">{desc}</p><ArrowDownLeft className="mt-8 text-white/35 transition group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:text-violet-200" size={19} /></article>)}
        </div>
      </section>

      <section id="work" className="container relative z-10 py-24">
        <div className="mb-12 flex items-end justify-between"><div><p className="mb-3 text-xs tracking-[.3em] text-cyan-200">SELECTED WORK</p><h2 className="text-4xl font-semibold sm:text-5xl">أعمال مختارة.</h2></div><span className="text-sm text-white/40">نماذج تصورية للعرض</span></div>
        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((project) => <article key={project.no} className="group"><div className={`glass relative mb-5 aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br ${project.tone}`}><div className="absolute inset-5 rounded-[1.5rem] border border-white/15" /><div className="absolute inset-0 grid place-items-center"><div className="h-40 w-40 rounded-[3rem] border border-white/30 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-500 group-hover:rotate-12 group-hover:scale-110" /></div><span className="absolute right-8 top-8 text-xs text-white/55">{project.no} / 03</span><span className="absolute bottom-8 left-8 text-xs tracking-[.2em] text-white/60">NOVA STUDIO</span></div><p className="mb-2 text-xs text-violet-200">{project.type}</p><h3 className="text-xl font-semibold">{project.name}</h3></article>)}
        </div>
      </section>

      <section id="process" className="container relative z-10 py-24">
        <div className="glass grid gap-12 rounded-[2.5rem] p-8 md:grid-cols-2 md:p-14">
          <div><p className="mb-3 text-xs tracking-[.3em] text-violet-300">OUR PROCESS</p><h2 className="text-4xl font-semibold leading-tight">من الفكرة<br /><span className="gradient-text">إلى التأثير.</span></h2><p className="mt-6 max-w-md leading-8 text-white/50">نؤمن أن أفضل النتائج تأتي من خطوات واضحة وتعاون مستمر. لذلك نجعل رحلتك معنا بسيطة وشفافة.</p></div>
          <div className="space-y-6">{[{n:"01",t:"نستكشف",d:"نفهم أهدافك وجمهورك والتحدي الذي تريد تجاوزه."},{n:"02",t:"نخطط ونصمم",d:"نضع الاتجاه الإبداعي ونحوّله إلى تجربة متكاملة."},{n:"03",t:"نبني ونطوّر",d:"ننفذ الحل ونراجع التفاصيل معك خطوة بخطوة."},{n:"04",t:"نطلق وننمو",d:"نطلق مشروعك ونبقى بجانبك للتحسين والتطوير."}].map(x=><div key={x.n} className="flex gap-5 border-b border-white/10 pb-5"><span className="pt-1 text-sm text-violet-300">{x.n}</span><div><h3 className="mb-1 text-lg font-semibold">{x.t}</h3><p className="text-sm leading-6 text-white/45">{x.d}</p></div></div>)}</div>
        </div>
      </section>

      <section id="pricing" className="container relative z-10 py-24">
        <div className="mb-12 text-center"><p className="mb-3 text-xs tracking-[.3em] text-cyan-200">FLEXIBLE PACKAGES</p><h2 className="text-4xl font-semibold sm:text-5xl">بداية تناسب <span className="gradient-text">طموحك.</span></h2><p className="mt-4 text-sm text-white/45">كل مشروع له احتياجاته، ونحدد التفاصيل بعد فهم المطلوب.</p></div>
        <div className="grid gap-4 lg:grid-cols-3">{plans.map(p=><article key={p.name} className={`rounded-3xl p-8 ${p.featured ? "border border-violet-300/40 bg-violet-300/[.09] shadow-[0_20px_80px_rgba(139,92,246,.10)]" : "glass"}`}><p className="text-sm text-white/55">{p.name}</p><h3 className="mt-4 text-2xl font-semibold">{p.price}</h3><p className="mt-2 text-sm text-white/45">{p.desc}</p><div className="my-7 h-px bg-white/10" /><ul className="space-y-4 text-sm text-white/70">{p.items.map(item=><li key={item} className="flex gap-3"><span className="text-emerald-200">✓</span>{item}</li>)}</ul><a href="#contact" className="mt-9 flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-slate-950">اطلب عرض سعر <ArrowUpLeft size={16} /></a></article>)}</div>
      </section>

      <section id="contact" className="container relative z-10 py-24">
        <div className="glass relative overflow-hidden rounded-[2.5rem] px-7 py-16 text-center md:px-16"><div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[80px]" /><p className="relative mb-4 text-xs tracking-[.3em] text-violet-200">LET’S CREATE SOMETHING</p><h2 className="relative text-4xl font-semibold sm:text-6xl">جاهز تبدأ <span className="gradient-text">حاجتك الجديدة؟</span></h2><p className="relative mx-auto mt-6 max-w-xl leading-8 text-white/50">احكيلنا عن فكرتك، وخلينا نرسم معًا الخطوة القادمة لمشروعك.</p><a href="mailto:hello@nova-agency.example" className="relative mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-semibold text-slate-950 transition hover:-translate-y-1">تواصل معنا <ArrowUpLeft size={18} /></a></div>
      </section>

      <footer className="container relative z-10 flex flex-col justify-between gap-5 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row"><span className="font-semibold tracking-[.25em] text-white/70">NOVA</span><span>© 2026 NOVA Digital Agency. All rights reserved.</span><a href="#" className="transition hover:text-white">العودة للأعلى ↑</a></footer>
    </main>
  );
}
