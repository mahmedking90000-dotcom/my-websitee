"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import ChatbotWidget from "@/components/chatbot-widget";
import Nova3DHero from "@/components/nova-3d-hero";
import { ArrowUpLeft, Sparkles, Code2, ShoppingBag, Palette, Layers3, Zap, Menu, X, Sun, Moon, MessageCircle, Check } from "lucide-react";

const wa = "https://wa.me/201116013702";
const content = {
  ar: {
    nav: ["الرئيسية", "خدماتنا", "أعمالنا", "طريقة العمل", "الباقات"],
    lang: "English", start: "ابدأ مشروعك", tag: "شريكك الإبداعي في العالم الرقمي",
    title: "نحوّل أفكارك إلى", accent: "تجارب رقمية استثنائية.",
    intro: "نصمم ونطور مواقع ومتاجر وحلولًا رقمية تساعد مشروعك على الظهور بصورة أقوى، وتمنح عملاءك تجربة تستحق التذكر.",
    explore: "استكشف أعمالنا", services: "حلول رقمية تنمو معك.", serviceIntro: "من التخطيط إلى الإطلاق، نجمع الاستراتيجية والتصميم والتقنية في خدمة نجاح مشروعك.",
    serviceNames: ["تصميم وتطوير المواقع", "المتاجر الإلكترونية", "تصميم UI/UX", "حلول رقمية مخصصة", "الهوية البصرية", "الصيانة والتطوير"],
    serviceDesc: ["مواقع سريعة ومتجاوبة تعكس احترافية نشاطك.", "متاجر منظمة لتقديم المنتجات وإدارة رحلة الشراء.", "واجهات واضحة تجعل استخدام منتجك أسهل.", "تطبيقات ويب ولوحات تحكم تناسب طريقة عملك.", "هوية متكاملة تمنح علامتك حضورًا مميزًا.", "متابعة فنية وتحسينات مستمرة لموقعك."],
    work: "أفكار تتحول إلى تجارب.", workNote: "نماذج تصورية توضح أسلوبنا الإبداعي وليست مشاريع منفذة لعملاء.",
    works: ["Luma — تجربة علامة تجارية", "North — موقع معماري", "Forma — واجهة إبداعية"],
    process: "خطوات واضحة. نتيجة أقوى.", steps: [["01","نفهم احتياجك","نحدد الهدف والجمهور والمتطلبات."],["02","نخطط ونصمم","نرسم تجربة واضحة تناسب علامتك."],["03","نطور ونختبر","نبني الحل ونراجعه على مختلف الشاشات."],["04","نطلق وندعم","نسلم المشروع ونوضح خطوات التشغيل."]],
    pricing: "باقات مرنة تناسب احتياجك.", pricingNote: "نحدد التكلفة بعد فهم تفاصيل المشروع، ولا نعرض أسعارًا غير معتمدة.",
    plans: [["Starter","صفحة هبوط أو موقع تعريفي",["تصميم متجاوب","نموذج تواصل","تهيئة SEO أساسية"]],["Business","موقع متكامل لنشاطك",["صفحات متعددة","تصميم UI/UX مخصص","إدارة محتوى حسب النطاق","تهيئة SEO"]],["Custom","حل رقمي بمواصفات خاصة",["وظائف مخصصة","لوحات تحكم وتكاملات","تخطيط تقني","دعم حسب الاتفاق"]]],
    contact: "عندك فكرة؟ خلينا ننفذها.", contactText: "احكيلنا عن مشروعك واحتياجاتك، وهنساعدك تحدد الخطوة المناسبة.",
    whatsapp: "تواصل عبر واتساب", theme: "تغيير المظهر", footer: "© 2026 NOVA. جميع الحقوق محفوظة."
  },
  en: {
    nav: ["Home", "Services", "Work", "Process", "Packages"],
    lang: "العربية", start: "Start a project", tag: "Your creative digital partner",
    title: "We turn ideas into", accent: "exceptional digital experiences.",
    intro: "We design and build websites, online stores, and digital solutions that help your business stand out and give customers an experience worth remembering.",
    explore: "Explore our work", services: "Digital solutions that grow with you.", serviceIntro: "From planning to launch, strategy, design, and technology work toward one goal: your success.",
    serviceNames: ["Website design & development", "E-commerce stores", "UI/UX design", "Custom digital solutions", "Visual identity", "Maintenance & growth"],
    serviceDesc: ["Fast, responsive websites for your business.", "Thoughtful online stores and smooth purchasing.", "Clear interfaces that make products easier to use.", "Web apps and dashboards shaped around your work.", "A cohesive identity with a distinct presence.", "Ongoing care and improvements for your website."],
    work: "Ideas shaped into experiences.", workNote: "Concept samples demonstrating our creative direction, not completed client projects.",
    works: ["Luma — Brand experience", "North — Architecture website", "Forma — Creative interface"],
    process: "Clear steps. Better outcomes.", steps: [["01","Discover","We learn about your goals, audience, and requirements."],["02","Plan & design","We shape a clear experience for your brand."],["03","Build & test","We develop and review across screen sizes."],["04","Launch & support","We deliver and guide you through what comes next."]],
    pricing: "Flexible packages for your needs.", pricingNote: "We prepare a quote after understanding your project. No unapproved prices are displayed.",
    plans: [["Starter","A landing page or simple business website",["Responsive design","Contact form","Basic SEO setup"]],["Business","A complete website for your business",["Multiple pages","Custom UI/UX","Content management by scope","SEO setup"]],["Custom","A digital solution built around your needs",["Custom functionality","Dashboards & integrations","Technical planning","Support by agreement"]]],
    contact: "Have an idea? Let's build it.", contactText: "Tell us about your project and goals, and we'll help you choose the right next step.",
    whatsapp: "Chat on WhatsApp", theme: "Toggle appearance", footer: "© 2026 NOVA. All rights reserved."
  }
} as const;
const icons = [Code2, ShoppingBag, Palette, Layers3, Zap, Sparkles];

function subscribePreferences(callback: () => void) {
  const notify = () => callback();
  window.addEventListener("storage", notify);
  window.addEventListener("nova-preferences-change", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("nova-preferences-change", notify);
  };
}

function readStoredTheme() {
  return localStorage.getItem("nova-theme") === "light";
}

function readStoredLanguage(): "ar" | "en" {
  return localStorage.getItem("nova-lang") === "en" ? "en" : "ar";
}

function savePreference(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event("nova-preferences-change"));
}

export default function Home() {
  const lang: "ar" | "en" = useSyncExternalStore(subscribePreferences, readStoredLanguage, () => "ar");
  const light = useSyncExternalStore(subscribePreferences, readStoredTheme, () => false);
  const [open, setOpen] = useState(false);
  const direction = lang === "ar" ? "rtl" : "ltr";
  useEffect(() => {
    const theme = light ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [light, lang, direction]);
  const t = content[lang];
  const link = (message: string) => wa + "?text=" + encodeURIComponent(message);
  const message = lang === "ar" ? "مرحبًا، أريد الاستفسار عن خدمات NOVA وبدء مشروع." : "Hello, I'd like to ask about NOVA services and start a project.";

  return (
    <main dir={direction} lang={lang} data-theme={light ? "light" : "dark"} className="site-shell min-h-screen overflow-hidden bg-[#080b14] text-white transition-colors">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-60" style={{backgroundImage:"radial-gradient(ellipse at 15% 5%,rgba(117,94,255,.2),transparent 35rem),radial-gradient(ellipse at 85% 25%,rgba(45,205,184,.12),transparent 30rem)"}} />
      <header className="container relative z-20 mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-5 py-5">
        <a href="#home" className="flex items-center gap-3 text-xl font-bold tracking-[.2em]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-white to-violet-300 text-slate-950"><Sparkles size={21}/></span>NOVA<span className="text-violet-300">.</span></a>
        <nav className={(open ? "absolute left-5 right-5 top-20 grid rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl " : "hidden ") + "z-30 gap-4 text-sm text-white/70 md:static md:flex md:border-0 md:bg-transparent md:p-0 md:shadow-none"}>
          {t.nav.map((n: string,i: number)=><a key={n} href={["#home","#services","#work","#process","#pricing"][i]} onClick={()=>setOpen(false)} className="hover:text-white">{n}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={()=>savePreference("nova-theme", light ? "dark" : "light")} aria-label={t.theme} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5">{light?<Moon size={17}/>:<Sun size={17}/>}</button>
          <button onClick={()=>savePreference("nova-lang", lang==="ar" ? "en" : "ar")} className="rounded-xl border border-white/15 px-3 py-2 text-xs">{t.lang}</button>
          <a href="/start-project" className="nova-primary hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 md:inline-flex">{t.start}<ArrowUpLeft size={15}/></a>
          <button onClick={()=>setOpen(!open)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 md:hidden">{open?<X size={18}/>:<Menu size={18}/>}</button>
        </div>
      </header>

      <Nova3DHero lang={lang} tag={t.tag} title={t.title} accent={t.accent} intro={t.intro} start={t.start} explore={t.explore} />

      <section id="services" className="container relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs tracking-[.25em] text-violet-300">WHAT WE DO</p><h2 className="text-3xl font-semibold sm:text-4xl">{t.services}</h2></div><p className="max-w-md text-sm leading-7 text-white/45">{t.serviceIntro}</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{t.serviceNames.map((name: string,i: number)=>{const Icon=icons[i];return <article key={name} className="rounded-3xl border border-white/10 bg-white/[.045] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-300/40"><div className="mb-10 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-300/10 text-violet-200"><Icon size={22}/></span><span className="text-xs text-white/30">0{i+1}</span></div><h3 className="mb-3 text-lg font-semibold">{name}</h3><p className="text-sm leading-7 text-white/50">{t.serviceDesc[i]}</p></article>})}</div>
      </section>

      <section id="work" className="container relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs tracking-[.25em] text-teal-200">SELECTED CONCEPTS</p><h2 className="text-3xl font-semibold sm:text-4xl">{t.work}</h2></div><div className="flex flex-wrap items-center gap-4"><p className="max-w-md text-sm leading-7 text-white/40">{t.workNote}</p><a href="/portfolio" className="rounded-full border border-violet-300/30 px-5 py-3 text-sm text-violet-200 transition hover:bg-violet-300/10">{lang==="ar"?"مشاهدة كل الأعمال والفيديوهات":"View all work & videos"} ↗</a></div></div>
        <div className="grid gap-5 md:grid-cols-3">{t.works.map((name: string,i: number)=><article key={name}><div className={"relative mb-4 grid aspect-[4/5] place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br "+["from-fuchsia-500/30 via-violet-900/60 to-slate-950","from-cyan-400/25 via-blue-900/60 to-slate-950","from-amber-300/25 via-rose-900/50 to-slate-950"][i]}><div className="absolute inset-5 rounded-[1.5rem] border border-white/15"/><div className="h-40 w-40 rotate-[-12deg] rounded-[2.5rem] border border-white/40 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-500 hover:rotate-6 hover:scale-110"/><span className="absolute right-8 top-8 text-xs text-white/55">0{i+1} / 03</span><span className="absolute bottom-8 left-8 text-[10px] tracking-[.25em] text-white/50">NOVA CONCEPT</span></div><h3 className="text-lg font-semibold">{name}</h3></article>)}</div>
      </section>

      <section id="process" className="container relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[.045] p-7 backdrop-blur-xl md:grid-cols-2 md:p-12"><div><p className="mb-3 text-xs tracking-[.25em] text-violet-300">OUR PROCESS</p><h2 className="text-3xl font-semibold leading-relaxed sm:text-4xl">{t.process}</h2><p className="mt-5 max-w-sm text-sm leading-8 text-white/45">{lang==="ar"?"نبدأ بتواصل واضح ونكمل بتنفيذ منظم واهتمام بكل تفصيلة.":"We start with clear communication and follow through with thoughtful execution."}</p></div><div className="space-y-5">{t.steps.map(([num,title,desc]: readonly [string,string,string])=><div key={num} className="flex gap-4 border-b border-white/10 pb-5"><span className="pt-1 text-sm text-violet-300">{num}</span><div className="flex-1"><h3 className="mb-1 font-semibold">{title}</h3><p className="text-sm leading-6 text-white/45">{desc}</p></div><Check size={17} className="mt-1 text-emerald-200"/></div>)}</div></div>
      </section>

      <section id="pricing" className="container relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 text-center"><p className="mb-3 text-xs tracking-[.25em] text-teal-200">FLEXIBLE PACKAGES</p><h2 className="text-3xl font-semibold sm:text-4xl">{t.pricing}</h2><p className="mt-4 text-sm text-white/45">{t.pricingNote}</p></div>
        <div className="grid gap-4 lg:grid-cols-3">{t.plans.map(([name,desc,items]: readonly [string,string,readonly string[]],i: number)=><article key={name} className={"flex flex-col rounded-3xl p-7 "+(i===1?"border border-violet-300/40 bg-violet-300/[.08]":"border border-white/10 bg-white/[.04]")}><div className="text-sm text-white/50">{name}</div><h3 className="mt-5 min-h-16 text-xl font-semibold leading-8">{desc}</h3><div className="my-6 h-px bg-white/10"/><ul className="mb-8 space-y-4 text-sm text-white/65">{items.map((item: string)=><li key={item} className="flex gap-3"><Check size={17} className="text-emerald-200"/>{item}</li>)}</ul><a href={link((lang==="ar"?"مرحبًا، أريد تفاصيل باقة ":"Hello, I'd like details about the ")+name)} className="mt-auto flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-slate-950">{lang==="ar"?"اطلب عرض سعر":"Request a quote"}<ArrowUpLeft size={16}/></a></article>)}</div>
      </section>

      <section className="container relative z-10 mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.05] px-6 py-16 text-center backdrop-blur-xl md:px-14"><div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[80px]"/><div className="relative"><p className="mb-3 text-xs tracking-[.25em] text-violet-300">LET&apos;S CREATE SOMETHING</p><h2 className="text-3xl font-semibold sm:text-5xl">{t.contact}</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/50">{t.contactText}</p><a href={link(message)} className="nova-primary mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-slate-950"><MessageCircle size={18}/>{t.whatsapp}<ArrowUpLeft size={17}/></a><p className="mt-5 text-xs tracking-widest text-white/35">011 1601 3702</p></div></div>
      </section>

      <footer className="container relative z-10 mx-auto flex max-w-6xl flex-col justify-between gap-4 border-t border-white/10 px-5 py-8 text-xs text-white/40 sm:flex-row"><span className="font-bold tracking-[.2em] text-white/70">NOVA.</span><span>{t.footer}</span><a href="#home">{lang==="ar"?"العودة للأعلى ↑":"Back to top ↑"}</a></footer>
      <a href={link(message)} aria-label="WhatsApp" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl border border-white/30 bg-emerald-300 text-emerald-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-1"><MessageCircle size={24}/></a>
    <ChatbotWidget locale={lang} />
    </main>
  );
}
