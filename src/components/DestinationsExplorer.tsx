"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import { Icon } from "./Icons";

/** Searchable, filterable destinations rendered as boarding-pass cards. */
export default function DestinationsExplorer() {
  const { countries, site } = useContent();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("الكل");
  const ref = useRef<HTMLDivElement>(null);
  const kinds = ["الكل", ...Array.from(new Set(countries.map((c) => c.group ?? "").filter(Boolean))), ...Array.from(new Set(countries.map((c) => c.kind)))];
  const list = countries.filter((c) => (kind === "الكل" || c.kind === kind || c.group === kind) && (c.name + c.en).toLowerCase().includes(q.trim().toLowerCase()));

  useGSAP(
    () => {
      gsap.fromTo(".pass", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.55, ease: "power3.out", overwrite: true });
    },
    { scope: ref, dependencies: [q, kind] },
  );

  return (
    <div ref={ref}>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input className="field md:max-w-sm" placeholder="ابحث عن وجهة…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`badge ${kind === k ? "badge-sky bg-sky/15" : ""}`}>{k}</button>
          ))}
        </div>
      </div>
      <p className="mb-6 text-sm text-mist/60">{list.length} وجهة</p>
      <div className="grid gap-5 md:grid-cols-2">
        {list.map((c) => (
          <Link key={c.slug} href={`/visa/${c.slug}`} className="pass card group flex overflow-hidden p-0">
            <div className="flex-1 p-6">
              <div className="relative -mx-6 -mt-6 mb-5 h-40 overflow-hidden"><Image src={c.img} alt="" fill sizes="480px" className="object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#10284a] via-transparent to-transparent" /></div>
              <div className="flex items-center gap-4">
                <span className={`fi fi-${c.code} flag`} />
                <div>
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="font-serif text-xs tracking-[.2em] text-mist/50">{c.en.toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{c.types.map((t) => <span key={t} className="badge badge-sky text-xs">{t}</span>)}</div>
              <p className="mt-4 text-sm leading-7 text-mist/70">{c.note}</p>
            </div>
            <div className="relative flex w-28 shrink-0 flex-col items-center justify-center gap-2 border-r border-dashed border-white/25 bg-white/[.03] p-4 text-center md:w-32">
              <span className="absolute -top-3 right-[-11px] h-5 w-5 rounded-full bg-navy" />
              <span className="absolute -bottom-3 right-[-11px] h-5 w-5 rounded-full bg-navy" />
              <span className="font-serif text-[10px] tracking-[.25em] text-mist/50">PROCESSING</span>
              <span className="text-sm font-bold tabular-nums">{c.time}</span>
              <span className="text-xs text-mist/60">{c.kind}</span>
              <span className="mt-2 text-sky-2 transition-transform group-hover:-translate-x-1"><Icon name="arrow" className="h-5 w-5" /></span>
            </div>
          </Link>
        ))}
      </div>
      {!list.length && (
        <p className="card p-8 text-center text-mist/70">
          لا توجد وجهة بهذا الاسم.{" "}
          <a className="text-sky-2 hover:text-white" href={waLink(site.whatsapp, `السلام عليكم، أرغب في الاستفسار عن تأشيرة ${q}`)} target="_blank" rel="noopener">اسألنا مباشرة</a>
        </p>
      )}
    </div>
  );
}
