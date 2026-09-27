"use client";
import { useEffect, useRef } from "react";

type P = { sx: number; sy: number; cx: number; cy: number; t: number; v: number; r: number; blue: boolean };

/** Canvas field: hundreds of travellers stream along curved paths from every direction into one destination point (the brand symbol). */
export default function ParticleField({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parent = canvas.parentElement!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, tx = 0, ty = 0, raf = 0, running = true;
    const ps: P[] = [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const spawn = (p?: P): P => {
      const a = Math.random() * Math.PI * 2, R = Math.max(w, h) * rnd(0.55, 0.85);
      const sx = tx + Math.cos(a) * R, sy = ty + Math.sin(a) * R, m = rnd(-0.55, 0.55);
      const o = p ?? ({} as P);
      Object.assign(o, { sx, sy, cx: (sx + tx) / 2 - (sy - ty) * m, cy: (sy + ty) / 2 + (sx - tx) * m, t: p ? 0 : Math.random(), v: rnd(0.0015, 0.0036), r: rnd(0.8, 2.1), blue: Math.random() < 0.35 });
      return o;
    };

    const resize = () => {
      w = parent.clientWidth; h = parent.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = targetRef.current?.getBoundingClientRect(), pr = parent.getBoundingClientRect();
      tx = t ? t.left + t.width / 2 - pr.left : w / 2;
      ty = t ? t.top + t.height / 2 - pr.top : h / 2;
      ps.length = 0;
      for (let i = 0, n = w < 768 ? 70 : 170; i < n; i++) ps.push(spawn());
    };

    const frame = () => {
      if (!running) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        p.t += p.v * (0.6 + p.t * 1.6);
        if (p.t >= 1) { spawn(p); continue; }
        const u = 1 - p.t, t = p.t;
        const x = u * u * p.sx + 2 * u * t * p.cx + t * t * tx, y = u * u * p.sy + 2 * u * t * p.cy + t * t * ty;
        const a = Math.min(1, t * 3) * (1 - Math.pow(t, 6)) * 0.9;
        ctx.fillStyle = p.blue ? `rgba(99,182,234,${a})` : `rgba(255,255,255,${a * 0.75})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r * (0.6 + t * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const restart = () => { cancelAnimationFrame(raf); if (running) frame(); };
    resize(); frame();
    const ro = new ResizeObserver(resize); ro.observe(parent);
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting && !document.hidden; restart(); });
    io.observe(canvas);
    const vis = () => { running = !document.hidden; restart(); };
    document.addEventListener("visibilitychange", vis);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [targetRef]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
