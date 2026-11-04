"use client";

import { ArrowDownLeft, ArrowUpLeft, ArrowUpRight, MoveUpRight, Sparkles } from "lucide-react";

type Props = {
  lang: "ar" | "en";
  tag: string;
  title: string;
  accent: string;
  intro: string;
  start: string;
  explore: string;
};

export default function Nova3DHero({ lang, tag, title, accent, intro, start, explore }: Props) {
  const ar = lang === "ar";
  return (
    <section id="home" className="nova-hero container relative z-10 mx-auto grid min-h-[690px] max-w-6xl items-center gap-8 px-5 py-16 lg:grid-cols-[1.02fr_.98fr]">
      <div className="nova-hero-copy relative z-10">
        <div className="nova-eyebrow mb-7 inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-xs">
          <span className="nova-live-dot" />
          <span>{tag}</span>
          <span className="text-white/25">✦</span>
          <span className="tracking-[.2em] text-white/45">NOVA STUDIO</span>
        </div>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.25] tracking-tight sm:text-6xl xl:text-7xl">
          {title}
          <span className="nova-title-metal mt-2 block">{accent}</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-9 text-white/55 sm:text-lg">{intro}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="/start-project" className="nova-hero-primary inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold">
            {start}{ar ? <ArrowUpLeft size={18}/> : <ArrowUpRight size={18}/>}
          </a>
          <a href="#work" className="nova-hero-secondary inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm">
            {explore}<ArrowDownLeft size={17}/>
          </a>
        </div>
        <div className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-[10px] tracking-[.24em] text-white/35">
          <span>STRATEGY</span><span className="text-violet-300">✦</span><span>DESIGN</span><span className="text-violet-300">✦</span><span>DEVELOPMENT</span>
        </div>
      </div>

      <div className="nova-scene relative mx-auto aspect-square w-full max-w-[560px]" aria-label="NOVA three dimensional abstract visual">
        <div className="nova-scene-grid" />
        <div className="nova-orbit nova-orbit-one" />
        <div className="nova-orbit nova-orbit-two" />
        <div className="nova-orbit nova-orbit-three" />
        <div className="nova-orb-shadow" />
        <div className="nova-core-wrap">
          <div className="nova-core">
            <div className="nova-core-glint" />
            <div className="nova-core-mark"><Sparkles size={62} strokeWidth={1.1}/></div>
            <span className="nova-core-word">NOVA</span>
          </div>
        </div>
        <div className="nova-float-card nova-float-top">
          <span className="nova-card-kicker">DIGITAL EXPERIENCE</span>
          <span className="nova-card-value">Beyond the ordinary<span>✳</span></span>
        </div>
        <div className="nova-float-card nova-float-bottom">
          <span className="nova-card-icon"><MoveUpRight size={17}/></span>
          <span><span className="nova-card-kicker">CREATIVE TECHNOLOGY</span><span className="nova-card-value">Made to stand out</span></span>
        </div>
        <div className="nova-scene-index">01 <i /> 04</div>
        <div className="nova-scene-caption">FIG. 001 — THE NOVA DIMENSION</div>
      </div>
    </section>
  );
}
