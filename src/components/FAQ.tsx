"use client";
import { useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { Icon } from "./Icons";

/** FAQ: sticky intro + WhatsApp card on one side, numbered accordion on the other; the open question glows. */
export default function FAQ({ compact = false }: { compact?: boolean }) {
  const { faq, site } = useContent();
  const [open, setOpen] = useState<number | null>(0);
  const items = compact ? faq.slice(0, 4) : faq;
  return (
    <section id="faq" className="relative overflow-clip py-24 md:py-32">
      <div className="retro-grid" aria-hidden="true" />
      <div className="container-x relative grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead eyebrow="FAQ" title={compact ? "أسئلة شائعة" : "أسئلة تتكرر… وإجابات صريحة"} text={compact ? undefined : "قبل أن تبدأ، هذه أكثر الأسئلة التي يطرحها عملاؤنا، بإجابات بلا مجاملات."} link={compact ? undefined : { href: "/faq", label: "كل الأسئلة والبحث" }} />
          <div data-r className="card glow -mt-6 p-6">
            <p className="font-bold">لم تجد سؤالك؟</p>
            <p className="mt-1 text-sm leading-7 text-mist/65">اكتب لنا على واتساب ونرد خلال ساعات العمل.</p>
            <a href={waLink(site.whatsapp, "السلام عليكم، لدي سؤال: ")} target="_blank" rel="noopener" className="btn btn-primary mt-4 w-full justify-center">اسأل على واتساب <Icon name="arrow" className="h-4 w-4" /></a>
          </div>
        </Reveal>
        <Reveal className="space-y-3">
          {items.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} data-r className={`rounded-2xl border transition-all duration-400 ${on ? "border-sky/50 bg-sky/[.07] shadow-[0_20px_50px_-30px_rgba(46,148,210,.7)]" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}>
                <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="flex w-full items-center gap-4 p-5 text-start">
                  <span className={`font-serif text-lg transition-colors ${on ? "text-sky-2" : "text-mist/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-base font-semibold md:text-lg">{f.q}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${on ? "rotate-45 border-sky bg-sky text-white" : "border-white/20 text-sky-2"}`}>+</span>
                </button>
                <div className="acc" data-open={on}>
                  <div><p className="px-5 pb-5 leading-8 text-mist/80 md:pr-16">{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
