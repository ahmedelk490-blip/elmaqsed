import { useEffect, type RefObject } from "react";

/** Glides a horizontal rail to its next card every `ms` while visible; pauses for a few seconds after touch, drag or wheel. */
export function useRailAutoplay(ref: RefObject<HTMLElement | null>, selector: string, ms = 3000, pauseRef?: { current: number }) {
  useEffect(() => {
    const r = ref.current;
    if (!r || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = false, last = 0;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(r);
    const touch = () => { last = Date.now(); };
    r.addEventListener("pointerdown", touch, { passive: true });
    r.addEventListener("touchstart", touch, { passive: true });
    r.addEventListener("wheel", touch, { passive: true });
    const t = setInterval(() => {
      if (!inView || document.hidden || Date.now() - Math.max(last, pauseRef?.current ?? 0) < 5000) return;
      const cards = Array.from(r.querySelectorAll<HTMLElement>(selector));
      if (!cards.length) return;
      const rr = r.getBoundingClientRect(), mid = rr.left + rr.width / 2;
      let cur = 0, best = Infinity;
      cards.forEach((c, i) => { const b = c.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - mid); if (d < best) { best = d; cur = i; } });
      const b = (cards[cur + 1] ?? cards[0]).getBoundingClientRect();
      r.scrollBy({ left: b.left + b.width / 2 - mid, behavior: "smooth" });
    }, ms);
    return () => {
      clearInterval(t); io.disconnect();
      r.removeEventListener("pointerdown", touch); r.removeEventListener("touchstart", touch); r.removeEventListener("wheel", touch);
    };
  }, [ref, selector, ms, pauseRef]);
}
