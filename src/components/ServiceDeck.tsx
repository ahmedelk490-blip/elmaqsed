"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import { Icon } from "./Icons";

gsap.registerPlugin(useGSAP, Draggable);

/** Mobile: services as a swipeable card deck. Drag the top card sideways and it flies to the back of the pile. */
export default function ServiceDeck() {
  const { services, site } = useContent();
  const [order, setOrder] = useState(() => services.map((_, i) => i));
  const ref = useRef<HTMLDivElement>(null);

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
          if (Math.abs(this.x) > 80) {
            const dir = Math.sign(this.x);
            gsap.to(el, { x: dir * 460, rotation: dir * 22, opacity: 0, duration: 0.32, ease: "power2.in", onComplete: () => { gsap.set(el, { clearProps: "transform,opacity" }); setOrder((o) => [...o.slice(1), o[0]]); } });
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
    <div>
      <div ref={ref} className="relative mx-auto h-[470px] w-full max-w-sm">
        {order.slice(0, 3).map((idx, depth) => {
          const s = services[idx];
          return (
            <div key={idx} className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ zIndex: 10 - depth, transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.06})`, opacity: depth === 2 ? 0.5 : 1 }}>
              <article data-top={depth === 0 ? "1" : "0"} className="relative h-full touch-pan-y overflow-hidden rounded-3xl border border-white/10 bg-navy-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)]">
                <Image src={s.img} alt="" fill sizes="384px" draggable={false} className="pointer-events-none object-cover brightness-110" />
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
      <p className="mt-10 flex items-center justify-center gap-3 text-sm text-mist/60"><Icon name="arrow" className="h-4 w-4 rotate-180" />اسحب البطاقة لاكتشاف الخدمة التالية<Icon name="arrow" className="h-4 w-4" /></p>
      <div className="mt-4 flex justify-center gap-2">
        {services.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${order[0] === i ? "w-6 bg-sky" : "w-1.5 bg-white/25"}`} />)}
      </div>
    </div>
  );
}
