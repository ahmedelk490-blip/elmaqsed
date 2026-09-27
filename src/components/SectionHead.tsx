"use client";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Props = { eyebrow: string; title: string; text?: string; center?: boolean; link?: { href: string; label: string } };

/** Section heading: the title slides up line by line out of a mask when it scrolls into view. */
export default function SectionHead({ eyebrow, title, text, center = false, link }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const h = ref.current!.querySelector("h2")!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(h, {
          type: "words",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(h, { opacity: 1 });
            return gsap.from(self.words, { opacity: 0, y: 18, filter: "blur(12px)", duration: 0.9, ease: "power3.out", stagger: 0.05, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(h, { opacity: 1 }));
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`mb-14 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p data-r className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="split-h text-balance text-[2.1rem] font-bold leading-[1.3] sm:text-4xl md:text-5xl">{title}</h2>
      {text && <p data-r className="mt-5 text-lg leading-8 text-mist/75">{text}</p>}
      {link && (
        <Link data-r href={link.href} className="mt-6 inline-flex items-center gap-2 text-sky-2 transition-colors hover:text-white">
          {link.label} <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
