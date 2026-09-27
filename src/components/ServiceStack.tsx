"use client";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import DrawIcon from "./DrawIcon";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Services as sticky cards that stack: each new card slides over the previous one, which recedes; photos drift inside. */
export default function ServiceStack() {
  const { services, site } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".stack-card", ref.current);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (next) gsap.to(card.querySelector(".stack-inner"), { scale: 0.9, opacity: 0.3, ease: "none", scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true } });
          gsap.fromTo(card.querySelector(".stack-img img"), { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref}>
      {services.map((s, i) => (
        <article key={s.title} id={`s${i + 1}`} className="stack-card mb-6 scroll-mt-28 lg:sticky lg:mb-28" style={{ top: `${104 + i * 16}px` }}>
          <div className="stack-inner card grid origin-top overflow-hidden p-0 lg:min-h-[64vh] lg:grid-cols-[1.05fr_.95fr]">
            <div className="flex flex-col justify-center p-7 md:p-12">
              <div className="flex items-center gap-5"><DrawIcon name={s.icon} /><span className="num-outline font-serif text-7xl md:text-8xl">{String(i + 1).padStart(2, "0")}</span></div>
              <h2 className="mt-7 text-3xl font-bold md:text-4xl">{s.title}</h2>
              <p className="mt-4 max-w-xl text-lg leading-9 text-mist/75">{s.text}</p>
              <ul className="mt-6 space-y-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3"><span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky/15 text-sky-2"><Icon name="check" className="h-3.5 w-3.5" /></span><span className="leading-8 text-mist/90">{b}</span></li>
                ))}
              </ul>
              <a href={waLink(site.whatsapp, `السلام عليكم، أرغب في خدمة: ${s.title}`)} target="_blank" rel="noopener" className="btn btn-primary mt-8 w-fit">اطلب هذه الخدمة <Icon name="arrow" className="h-5 w-5" /></a>
            </div>
            <div className="stack-img relative min-h-[240px] overflow-hidden lg:min-h-0">
              <Image src={s.img} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover brightness-[1.2] saturate-[1.1]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-navy/70" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
