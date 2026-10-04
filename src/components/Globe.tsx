"use client";
import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";

const RIYADH: [number, number] = [24.71, 46.68];
const dests: [number, number][] = [
  [48.85, 2.35], [52.52, 13.4], [41.9, 12.5], [52.37, 4.9], [40.42, -3.7], [59.33, 18.07], [46.95, 7.45], [50.08, 14.44],
  [48.21, 16.37], [47.5, 19.04], [37.98, 23.73], [38.72, -9.14], [38.9, -77.04], [51.5, -0.12], [3.14, 101.69], [41.0, 28.97],
  [-4.62, 55.45], [30.04, 31.24], [-6.2, 106.85], [25.2, 55.27], [25.29, 51.53], [26.22, 50.59],
];
// The fixed pose: Arabia just right of centre, Europe up-left, South-East Asia towards the right edge.
const HOME = { phi: 4.01, theta: 0.33 };

/**
 * Brand-navy dotted globe with flight arcs out of Riyadh, held in one pose: it turns into place when it first appears,
 * springs back after a drag, and then stops drawing. If the browser has no WebGL or the GPU drops the context, a drawn
 * globe is shown instead and the canvas is retried twice.
 */
export default function Globe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [gen, setGen] = useState(0); // bump = mount a fresh canvas
  const [dead, setDead] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = el.offsetWidth || 300;
    // cobe multiplies width/height by devicePixelRatio itself. Never below 1: a scaled-down preview reports less and turned the globe to mush.
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = still ? HOME.phi : HOME.phi - 0.8, velocity = 0, dragging = false, lastX = 0, raf = 0, visible = false, awake = 0, retry = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const fail = () => {
      cancelAnimationFrame(raf);
      setDead(true);
      if (tries.current++ < 2) retry = window.setTimeout(() => { setDead(false); setGen((g) => g + 1); }, 2500);
    };
    try {
      // dark mode paints the sphere at a tenth of baseColor, so these values give a flat brand-navy body with azure land dots
      globe = createGlobe(el, {
        devicePixelRatio: dpr, width: size, height: size, phi, theta: HOME.theta, dark: 1, diffuse: 1.2,
        mapSamples: 16000, mapBrightness: 0.55, baseColor: [0.5, 1.1, 2.1], markerColor: [0.62, 0.84, 1], glowColor: [0.6, 0.8, 1],
        markers: [...dests.map((location) => ({ location, size: 0.03 })), { location: RIYADH, size: 0.07, color: [1, 1, 1] as [number, number, number] }],
        // light arcs: clear over the navy sphere, and they fade into the pale background where they pass its edge
        arcs: dests.map((to) => ({ from: RIYADH, to })), arcColor: [0.62, 0.84, 1], arcWidth: 0.45, arcHeight: 0.2, markerElevation: 0,
      });
    } catch {
      queueMicrotask(fail);
      return () => clearTimeout(retry);
    }
    const g = globe;
    const tick = (now: number) => {
      raf = 0;
      if (!dragging) { velocity *= 0.92; phi += velocity + (HOME.phi - phi) * 0.06; }
      g.update({ phi });
      // settled = static: nothing is drawn again until a drag, a resize or the next time it scrolls into view
      if (visible && (dragging || now < awake || Math.abs(HOME.phi - phi) > 0.002 || Math.abs(velocity) > 0.0005)) raf = requestAnimationFrame(tick);
    };
    const wake = (ms = 400) => { awake = performance.now() + ms; if (visible && !raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(1500); else { cancelAnimationFrame(raf); raf = 0; } });
    io.observe(el);
    // keep the drawing buffer matched to the box (rotation, a late layout, a resized window)
    const ro = new ResizeObserver(() => { const s = el.offsetWidth; if (s && s !== size) { size = s; g.update({ width: s, height: s }); wake(); } });
    ro.observe(el);
    const lost = (e: Event) => { e.preventDefault(); fail(); };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; velocity = 0; el.style.cursor = "grabbing"; el.setPointerCapture(e.pointerId); wake(); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const d = (e.clientX - lastX) * 0.006;
      lastX = e.clientX; phi += d; velocity = d;
    };
    const up = () => {
      dragging = false; el.style.cursor = "grab";
      phi = HOME.phi + ((((phi - HOME.phi + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI; // go home the short way round
      wake();
    };
    el.addEventListener("webglcontextlost", lost);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(retry);
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
