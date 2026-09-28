"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger);

const rot = (n: number, i: number) => Array.from({ length: n }, (_, k) => (i + k) % n);

function flyOut(el: HTMLElement, dir: number, done: () => void) {
  gsap.to(el, { x: dir * 460, rotation: dir * 22, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => { gsap.set(el, { clearProps: "transform,opacity" }); done(); } });
}

/** Phones & tablets: services as a card deck. The deck pins while you scroll and each scroll step deals the next card; the page moves on after the last one. Cards can also be swiped. */
export default function ServiceDeck() {
  const { services, site } = useContent();
  const n = services.length;
  const [order, setOrder] = useState(() => rot(n, 0));
  const root = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const cur = useRef(0); // card on top
  const want = useRef(0); // card the scroll position asks for
  const st = useRef<ScrollTrigger | null>(null);
  const sync = useRef<() => void>(() => {});

  // step the deck one card at a time toward `want` (fly-out for a single forward step, reshuffle otherwise)
  useEffect(() => {
    sync.current = () => {
      if (busy.current || want.current === cur.current) return;
      const el = ref.current?.querySelector<HTMLElement>('[data-top="1"]');
      if ((want.current - cur.current + n) % n === 1 && el) {
        busy.current = true;
        const next = want.current;
        flyOut(el, -1, () => { busy.current = false; cur.current = next; setOrder(rot(n, next)); });
      } else {
        cur.current = want.current;
        setOrder(rot(n, want.current));
      }
    };
  }, [n]);

  // keep stepping until the deck matches the scroll position
  useEffect(() => {
    const id = requestAnimationFrame(() => sync.current());
    return () => cancelAnimationFrame(id);
  }, [order]);

  // pin the deck; scroll progress picks the card
  useGSAP(
    () => {
      gsap.matchMedia().add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        st.current = ScrollTrigger.create({
          trigger: root.current,
          start: "center center",
          end: () => "+=" + Math.round(window.innerHeight * 0.4 * n),
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { want.current = Math.min(n - 1, Math.floor(self.progress * n)); sync.current(); },
        });
        return () => { st.current = null; };
      });
    },
    { scope: root, dependencies: [n] },
  );

  // swipe the top card; while pinned, the page scroll follows so both stay in step
  useGSAP(
    () => {
      const top = ref.current?.querySelector<HTMLElement>('[data-top="1"]');
      if (!top) return;
      const [d] = Draggable.create(top, {
        type: "x",
        allowNativeTouchScrolling: true,
        onDrag: function (this: Draggable) { gsap.set(this.target, { rotation: this.x / 16 }); },
        onDragEnd: function (this: Draggable) {
          const el = this.target as HTMLElement;
          const t = st.current;
          if (Math.abs(this.x) > 80 && !busy.current && !(t && cur.current === n - 1)) {
            busy.current = true;
            const next = (cur.current + 1) % n;
            flyOut(el, Math.sign(this.x), () => {
              busy.current = false;
              cur.current = want.current = next;
              setOrder(rot(n, next));
              if (t) t.scroll(t.start + ((t.end - t.start) * (next + 0.5)) / n);
            });
          } else {
            gsap.to(el, { x: 0, rotation: 0, duration: 0.5, ease: "back.out(2)" });
          }
        },
      });
      return () => d.kill();
    },
    { scope: ref, dependencies: [order], revertOnUpdate: true },
  );

  return (
    <div ref={root}>
      <div ref={ref} className="relative mx-auto h-[470px] w-full max-w-sm md:h-[560px] md:max-w-lg">
        {order.slice(0, 3).map((idx, depth) => {
          const s = services[idx];
          return (
            <div key={idx} className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ zIndex: 10 - depth, transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.06})`, opacity: depth === 2 ? 0.5 : 1 }}>
              <article data-top={depth === 0 ? "1" : "0"} className="relative h-full touch-pan-y overflow-hidden rounded-3xl border border-white/10 bg-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)]">
                <Image src={s.img} alt="" fill sizes="(min-width: 768px) 512px, 384px" draggable={false} className="pointer-events-none object-cover brightness-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="num-outline font-serif text-6xl">{String(idx + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 line-clamp-3 leading-7 text-mist/80">{s.text}</p>
                  <a href={waLink(site.whatsapp, `السلام عليكم، أرغب في خدمة: ${s.title}`)} target="_blank" rel="noopener" className="btn btn-primary btn-sm mt-5">اطلب الخدمة <Icon name="arrow" className="h-4 w-4" /></a>
                </div>
              </article>
            </div>
          );
        })}
      </div>
      <p className="mt-10 flex items-center justify-center gap-3 text-sm text-mist/60"><Icon name="arrow" className="h-4 w-4 -rotate-90" />مرّر لتقليب البطاقات، أو اسحبها بنفسك</p>
      <div className="mt-4 flex justify-center gap-2">
        {services.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${order[0] === i ? "w-8 bg-sky" : "w-1.5 bg-white/25"}`} />
        ))}
      </div>
    </div>
  );
}
