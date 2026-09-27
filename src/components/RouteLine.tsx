"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import Symbol from "./Symbol";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Metro-style route: a vertical line fills as you scroll and every station lights up in turn. */
export default function RouteLine() {
  const { steps, site } = useContent();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const fill = ref.current!.querySelector(".r-fill")!;
        gsap.set(fill, { scaleY: 0 });
        ScrollTrigger.create({ trigger: ref.current, start: "top 60%", end: "bottom 75%", onUpdate: (self) => gsap.set(fill, { scaleY: self.progress }) });
        gsap.utils.toArray<HTMLElement>(".r-station", ref.current).forEach((st) => {
          gsap.from(st.querySelectorAll(".r-in"), { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: st, start: "top 80%", once: true } });
          gsap.to(st.querySelector(".r-dot"), { backgroundColor: "#2e94d2", borderColor: "#2e94d2", boxShadow: "0 0 24px rgba(46,148,210,.9)", scale: 1.3, duration: 0.4, scrollTrigger: { trigger: st, start: "top 62%", toggleActions: "play none none reverse" } });
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-0 right-4 top-0 w-px bg-white/10 md:left-1/2 md:right-auto" />
      <div className="r-fill absolute bottom-0 right-4 top-0 w-px origin-top bg-gradient-to-b from-sky-2 to-sky md:left-1/2 md:right-auto" />
      <ol className="space-y-16 md:space-y-24">
        {steps.map((s, i) => (
          <li key={s.n} className={`r-station relative pr-14 md:w-1/2 ${i % 2 ? "md:mr-auto md:pr-16" : "md:pl-16 md:pr-0"}`}>
            <span className={`r-dot absolute top-3 h-[15px] w-[15px] rounded-full border border-white/40 bg-navy right-[9px] ${i % 2 ? "md:right-[-7px]" : "md:left-[-7px] md:right-auto"}`} />
            <span className="r-in block font-serif text-5xl leading-none text-sky-2/70">{s.n}</span>
            <h3 className="r-in mt-4 text-2xl font-bold md:text-3xl">{s.title}</h3>
            <p className="r-in mt-3 max-w-md leading-8 text-mist/75">{s.text}</p>
          </li>
        ))}
        <li className="r-station relative pr-14 md:mx-auto md:w-1/2 md:px-0 md:text-center">
          <span className="r-dot absolute top-1 grid h-9 w-9 place-items-center rounded-full bg-navy right-[-3px] md:left-1/2 md:right-auto md:-top-3 md:-translate-x-1/2">
            <Symbol className="h-8 w-8 text-white" id="route" />
          </span>
          <div className="md:pt-12">
            <Symbol className="r-in mx-auto h-14 w-14 text-white drop-shadow-[0_0_24px_rgba(46,148,210,.7)]" id="route-big" />
            <h3 className="r-in mt-4 text-3xl font-bold">وصلت إلى مقصدك</h3>
            <p className="r-in mx-auto mt-3 max-w-md leading-8 text-mist/75">تأشيرة في الجواز وخطة سفر واضحة. وحين تفكر في وجهتك التالية، ملفك جاهز عندنا.</p>
            <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="r-in btn btn-primary mt-6">ابدأ رحلتك الآن</a>
          </div>
        </li>
      </ol>
    </div>
  );
}
