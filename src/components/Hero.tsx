"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Symbol from "./Symbol";
import BgImage from "./BgImage";
import HeroSearch from "./HeroSearch";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SERVICES = ["تأشيرة شنغن", "تأشيرة أمريكا", "بريطانيا ETA", "تأشيرات المقيمين", "حجز الفنادق", "ملف سفرك كاملاً"];

/** The headline writes the services one after another. */
function Typed() {
  const [text, setText] = useState(SERVICES[0]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0, ch = SERVICES[0].length, del = true, hold = 24;
    const t = setInterval(() => {
      if (hold > 0) { hold--; return; }
      ch += del ? -1 : 1;
      if (del && ch <= 0) { del = false; ch = 0; i = (i + 1) % SERVICES.length; }
      else if (!del && ch >= SERVICES[i].length) { del = true; hold = 28; }
      setText(SERVICES[i].slice(0, ch));
    }, 65);
    return () => clearInterval(t);
  }, []);
  return <span className="typed grad-text" aria-hidden="true">{text}</span>;
}

/** Search-first hero: the brand symbol assembles, the headline types the services, and the visitor picks a visa or a hotel right away. */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Brand story: arrows arrive from different directions and converge on one destination point.
        const svg = ref.current!.querySelector<SVGSVGElement>(".sym-svg")!;
        const vb = svg.viewBox.baseVal;
        const cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
        const arrows = gsap.utils.toArray<SVGPathElement>(".sym-arrow", svg);
        arrows.forEach((p) => {
          const b = p.getBBox();
          gsap.set(p, { x: (b.x + b.width / 2 - cx) * 1.3, y: (b.y + b.height / 2 - cy) * 1.3, opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
        });
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .to(arrows, { x: 0, y: 0, opacity: 1, scale: 1, duration: 1.1, stagger: { each: 0.06, from: "random" } }, 0.1)
          .fromTo(".sym-core", { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(3)" }, 0.7)
          .fromTo(".sym-glow", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1 }, 0.7)
          .fromTo("[data-h]", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.25);
        gsap.to(".sym-glow", { opacity: 0.55, scale: 1.15, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2 });
      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-content", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(["[data-h]", ".sym-glow"], { autoAlpha: 1 }));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-[84px]">
      <BgImage src="/img/p05.jpg" priority kenburns overlay="bg-[radial-gradient(ellipse_at_50%_45%,rgba(11,31,57,.97)_0%,rgba(11,31,57,.93)_42%,rgba(11,31,57,.74)_100%)]" />
      <div className="orb absolute left-[10%] top-[16%] h-72 w-72 rounded-full bg-sky/25 blur-[90px]" />
      <div className="orb absolute right-[8%] top-[52%] h-96 w-96 rounded-full bg-[#1d4f8f]/40 blur-[110px]" />
      <div className="grid-bg absolute inset-0 opacity-70" />

      <div className="hero-content container-x relative flex flex-col items-center py-10 text-center md:py-14">
        <div className="relative mb-5 w-16 md:mb-7 md:w-24">
          <div className="sym-glow absolute inset-[-45%] rounded-full bg-[radial-gradient(circle,rgba(46,148,210,.55),transparent_65%)]" />
          <Symbol className="sym-svg relative w-full text-white" id="hero" />
        </div>
        <h1 data-h className="text-[2.1rem] font-bold leading-[1.3] sm:text-6xl lg:text-7xl">
          <span className="sr-only">المقصد: تأشيرات السفر وحجز الفنادق من السعودية</span>
          <span aria-hidden="true" className="block">نجهّز لك</span>
          <span className="block min-h-[1.3em]"><Typed /></span>
        </h1>
        <p data-h className="mt-4 max-w-xl text-base leading-8 text-mist/85 md:mt-6 md:text-xl md:leading-9">
          اختر وجهتك وقدّم طلبك في دقيقتين، ونحن نجهّز ملفك ونتابعه حتى الاستلام.
        </p>
        <div data-h className="mt-7 w-full max-w-4xl md:mt-9"><HeroSearch /></div>
        <ul data-h className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-mist/70">
          <li>✓ رد خلال 24 ساعة</li>
          <li>✓ سعر واضح قبل البدء</li>
          <li>✓ متابعة حتى الاستلام</li>
        </ul>
        <a href="#services" data-h className="mt-6 hidden items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-mist/85 transition-colors hover:border-sky hover:text-white md:inline-flex">تعرّف على خدماتنا <span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
