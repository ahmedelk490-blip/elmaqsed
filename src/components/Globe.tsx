"use client";
import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";

const RIYADH: [number, number] = [24.71, 46.68];
const dests: [number, number][] = [
  [48.85, 2.35], [52.52, 13.4], [41.9, 12.5], [52.37, 4.9], [40.42, -3.7], [59.33, 18.07], [46.95, 7.45], [50.08, 14.44],
  [48.21, 16.37], [47.5, 19.04], [37.98, 23.73], [38.72, -9.14], [38.9, -77.04], [51.5, -0.12], [3.14, 101.69], [41.0, 28.97],
  [-4.62, 55.45], [30.04, 31.24], [-6.2, 106.85], [25.2, 55.27], [25.29, 51.53], [26.22, 50.59],
];

/**
 * Dotted globe with flight arcs out of Riyadh. Drag it left/right to spin (with inertia); renders only while on screen.
 * If the browser has no WebGL or the GPU drops the context, a drawn globe is shown instead and the canvas is retried twice.
 */
export default function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [gen, setGen] = useState(0); // bump = mount a fresh canvas
  const [dead, setDead] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const size = el.offsetWidth || 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 4.2, velocity = 0, dragging = false, lastX = 0, raf = 0, visible = false, retry = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const fail = () => {
      cancelAnimationFrame(raf);
      setDead(true);
      if (tries.current++ < 2) retry = window.setTimeout(() => { setDead(false); setGen((g) => g + 1); }, 2500);
    };
    try {
      globe = createGlobe(el, {
        devicePixelRatio: dpr, width: size * dpr, height: size * dpr, phi, theta: 0.28, dark: 1, diffuse: 1.4,
        mapSamples: 12000, mapBrightness: 5, baseColor: [0.08, 0.2, 0.38], markerColor: [0.39, 0.71, 0.92], glowColor: [0.08, 0.28, 0.55],
        markers: [...dests.map((location) => ({ location, size: 0.05 })), { location: RIYADH, size: 0.1 }],
        arcs: dests.map((to) => ({ from: RIYADH, to })), arcColor: [0.39, 0.71, 0.92], arcWidth: 0.6, arcHeight: 0.35,
      });
    } catch {
      queueMicrotask(fail);
      return () => clearTimeout(retry);
    }
    const g = globe;
    const tick = () => {
      if (!dragging) { phi += (still ? 0 : 0.003) + velocity; velocity *= 0.94; }
      g.update({ phi });
      raf = requestAnimationFrame(tick);
    };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else cancelAnimationFrame(raf); });
    io.observe(el);
    const lost = (e: Event) => { e.preventDefault(); fail(); };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; velocity = 0; el.style.cursor = "grabbing"; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const d = (e.clientX - lastX) * 0.006;
      lastX = e.clientX; phi += d; velocity = d;
      if (!visible) g.update({ phi });
    };
    const up = () => { dragging = false; el.style.cursor = "grab"; };
    el.addEventListener("webglcontextlost", lost);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      io.disconnect(); cancelAnimationFrame(raf); clearTimeout(retry);
      try { g.destroy(); } catch { /* context already gone */ }
      el.removeEventListener("webglcontextlost", lost);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  }, [gen]);

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      {dead
        ? <div className="globe-fallback" aria-hidden="true" />
        : <canvas key={gen} ref={ref} className="h-full w-full cursor-grab" style={{ contain: "layout paint size", touchAction: "pan-y" }} aria-label="اسحب الكرة لتدويرها" />}
    </div>
  );
}
