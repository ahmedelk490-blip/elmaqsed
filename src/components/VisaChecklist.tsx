"use client";
import { useState } from "react";
import { waLink } from "@/lib/types";
import { Icon } from "./Icons";

/** Tickable document list with a live readiness ring; sends the missing items to WhatsApp. */
export default function VisaChecklist({ reqs, country, whatsapp }: { reqs: string[]; country: string; whatsapp: string }) {
  const [done, setDone] = useState<boolean[]>(() => reqs.map(() => false));
  const n = done.filter(Boolean).length;
  const pct = reqs.length ? n / reqs.length : 0;
  const R = 52, C = 2 * Math.PI * R;
  const missing = reqs.filter((_, i) => !done[i]);
  const msg = `السلام عليكم، أجهّز ملف تأشيرة ${country}.\nجاهز: ${n}/${reqs.length}\nينقصني:\n${missing.length ? missing.map((m) => "- " + m).join("\n") : "- لا شيء، الملف مكتمل"}`;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <ul className="grid gap-3 sm:grid-cols-2">
        {reqs.map((r, i) => (
          <li key={r}>
            <button type="button" onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))} aria-pressed={done[i]} className={`chk ${done[i] ? "is-on" : ""}`}>
              <span className="chk-box"><Icon name="check" className="h-4 w-4" /></span>
              <span className="text-start leading-7">{r}</span>
            </button>
          </li>
        ))}
      </ul>
      <aside className="card glow h-fit p-7 text-center lg:sticky lg:top-28">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <defs><linearGradient id="ring-g"><stop offset="0" stopColor="#63b6ea" /><stop offset="1" stopColor="#2e94d2" /></linearGradient></defs>
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="url(#ring-g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)" }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center"><span><b className="font-serif text-4xl">{n}</b><span className="text-mist/50">/{reqs.length}</span></span></span>
        </div>
        <p className="mt-4 font-bold">{pct === 1 ? "ملفك مكتمل ✓" : "جاهزية ملفك"}</p>
        <p className="mt-1 text-sm leading-7 text-mist/60">علّم ما لديك من مستندات، ونراجع الباقي معك.</p>
        <a href={waLink(whatsapp, msg)} target="_blank" rel="noopener" className="btn btn-primary mt-5 w-full justify-center">أرسل قائمتي عبر واتساب</a>
      </aside>
    </div>
  );
}
