"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Symbol from "./Symbol";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const TEXT = "كل عميل يصل إلينا بمسار مختلف وظروف مختلفة. نحن لا نبيع وعوداً، بل نرسم لك أوضح طريق نحو مقصدك: ملف مكتمل، خطوات معلومة، ومستشار واحد يرافقك حتى ختم الجواز.";

/** Brand statement whose words brighten one by one as the reader scrolls through it. */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const p = ref.current!.querySelector("p")!;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(p, {
          type: "words",
          autoSplit: true,
          onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: p, start: "top 78%", end: "bottom 42%", scrub: 0.5 } }),
        });
      });
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/10 blur-[120px]" />
      <div className="container-x relative max-w-5xl text-center">
        <div className="relative mx-auto mb-12 h-40 w-40" style={{ perspective: 900 }} aria-hidden="true">
          <div className="cube absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {["f", "b", "l", "r", "t", "d"].map((f) => <span key={f} className={`cube-face cube-${f}`} />)}
          </div>
          <Symbol className="absolute inset-[24%] text-white drop-shadow-[0_0_24px_rgba(46,148,210,.7)]" id="stmt" />
          <span className="absolute -bottom-8 left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-sky/40 blur-xl" />
        </div>
        <p className="text-2xl font-bold leading-[1.8] md:text-4xl md:leading-[1.7]">{TEXT}</p>
      </div>
    </section>
  );
}
