"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import BgImage from "./BgImage";
import HeroSearch from "./HeroSearch";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Hero: the headline and the search box for a visa, a hotel, an eSIM or a package. */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-h]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power4.out", delay: 0.5 });

        SplitText.create(".hero-title", {
          type: "words",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(".hero-title", { opacity: 1 });
            return gsap.from(self.words, { opacity: 0, y: 26, filter: "blur(16px)", duration: 1, ease: "power3.out", stagger: 0.07, delay: 0.7 });
          },
        });

      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-content", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(["[data-h]", ".hero-title"], { autoAlpha: 1 }));
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-[84px] lg:min-h-0 lg:items-start lg:pb-20 lg:pt-[108px]">
      <BgImage src="/img/p05.jpg" priority kenburns overlay="bg-[linear-gradient(180deg,rgba(11,31,57,.76)_0%,rgba(11,31,57,.96)_30%,rgba(11,31,57,.985)_62%,#0b1f39_100%)]" />
      <div className="orb absolute left-[10%] top-[16%] h-72 w-72 rounded-full bg-sky/25 blur-[90px]" />
      <div className="orb absolute right-[8%] top-[52%] h-96 w-96 rounded-full bg-[#1d4f8f]/40 blur-[110px]" />
      <div className="orb absolute -bottom-[10%] left-[38%] h-80 w-80 rounded-full bg-white/10 blur-[100px]" />
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10%] h-[58%]" aria-hidden="true">
        {[0, 1, 2].map((i) => <span key={i} className="ripple-ring" style={{ animationDelay: `${i * 2.8}s` }} />)}
      </div>

      <div className="hero-content container-x relative flex flex-col items-center py-6 text-center md:py-6">
        <h1 className="hero-title max-w-3xl text-3xl font-semibold leading-[1.35] sm:text-4xl lg:text-5xl">
          مسار واضح
          <br />
          <span className="grad-text">لوجهتك الصحيحة</span>
        </h1>
        <p data-h className="mt-4 max-w-2xl text-[15px] leading-7 text-mist/85 md:mt-4 md:text-lg md:leading-8">
          استشارات تأشيرات السفر وتجهيز الطلبات باحترافية: نقيّم ملفك بصدق، نجهّز مستنداتك بدقة، ونرافقك خطوة بخطوة حتى تصل إلى مقصدك.
        </p>
        <div data-h className="mt-7 w-full min-w-0 max-w-5xl md:mt-6 xl:max-w-6xl"><HeroSearch /></div>
        <ul data-h className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-mist/70">
          <li>✓ شركة استشارية مرخصة</li>
          <li>✓ رد خلال 24 ساعة</li>
          <li>✓ رسوم واضحة قبل البدء</li>
        </ul>
      </div>
    </section>
  );
}
