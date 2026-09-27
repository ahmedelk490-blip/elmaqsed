"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { Icon } from "./Icons";

const rows: [string, string][] = [
  ["مستندات ناقصة تُكتشف عند السفارة", "قائمة مستندات مخصصة لحالتك ومراجعة مرتين"],
  ["نموذج بأخطاء في الأسماء والتواريخ", "نماذج مدققة حرفاً حرفاً قبل الإرسال"],
  ["حجوزات لا تتطابق مع برنامج الرحلة", "برنامج رحلة وحجوزات متسقة ومقنعة"],
  ["كشف حساب بلا تفسير للحركات", "كشف حساب مرتب مع خطاب تعريف واضح"],
  ["لا يوجد خطاب يشرح غرض السفر", "خطاب تغطية يروي قصتك بوضوح"],
  ["دخول المقابلة بلا تحضير", "جلسة تحضير بأسئلة المقابلة الحقيقية"],
];

function Panel({ good }: { good: boolean }) {
  return (
    <div className={`cmp-panel ${good ? "cmp-good" : "cmp-bad"}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold">{good ? "ملف جهّزه المقصد" : "ملف قُدّم على عجل"}</h3>
        <span className={`badge ${good ? "badge-sky" : "border-red-300/30 text-red-200"}`}>{good ? "فرص أعلى" : "مخاطر رفض"}</span>
      </div>
      <ul className="mt-8 space-y-3">
        {rows.map(([bad, ok]) => (
          <li key={ok} className="flex h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] px-5">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${good ? "bg-sky text-white" : "bg-red-400/15 text-red-300"}`}>
              {good ? <Icon name="check" className="h-4 w-4" /> : <span className="text-sm font-bold">✕</span>}
            </span>
            <span className={good ? "text-white" : "text-mist/65"}>{good ? ok : bad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Drag the divider: the right side shows a rushed file, the left side the same file prepared by Elmaqsed. */
export default function CompareSlider() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    const el = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const proxy = { v: 50 };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      tl.current = gsap.timeline({ delay: 0.3, onUpdate: () => setPos(proxy.v) })
        .to(proxy, { v: 25, duration: 0.9, ease: "power2.inOut" })
        .to(proxy, { v: 75, duration: 1.2, ease: "power2.inOut" })
        .to(proxy, { v: 50, duration: 0.8, ease: "power2.inOut" });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); tl.current?.kill(); };
  }, []);
  return (
    <section className="relative py-24 md:py-32">
      <div className="container-x">
        <Reveal><SectionHead eyebrow="The difference" title="نفس التأشيرة… ملفّان مختلفان" text="اسحب الفاصل لترى الفرق بين ملف يُقدَّم على عجل، وملف جهّزه المقصد." center /></Reveal>
        <div ref={ref} className="relative mx-auto hidden max-w-5xl select-none overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] md:block">
          <Panel good />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}><Panel good={false} /></div>
          <div className="cmp-handle" style={{ left: `${pos}%` }}><span><Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /><Icon name="arrow" className="h-3.5 w-3.5" /></span></div>
          <input type="range" min={3} max={97} step={0.5} value={pos} dir="ltr" aria-label="قارن بين الملفين" onChange={(e) => { tl.current?.kill(); setPos(Number(e.target.value)); }} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
        </div>
        <div className="grid gap-4 md:hidden"><Panel good={false} /><Panel good /></div>
      </div>
    </section>
  );
}
