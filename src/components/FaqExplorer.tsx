"use client";
import { useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";

/** Help-center style FAQ: live search, category tabs, numbered accordion and a sticky "ask us" panel. */
export default function FaqExplorer() {
  const { faq, site } = useContent();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [open, setOpen] = useState<number | null>(0);
  const cats = ["الكل", ...Array.from(new Set(faq.map((f) => f.cat)))];
  const list = faq.filter((f) => (cat === "الكل" || f.cat === cat) && (f.q + f.a).includes(q.trim()));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div>
        <input className="field mb-5" placeholder="اكتب سؤالك أو كلمة للبحث…" value={q} onChange={(e) => { setQ(e.target.value); setOpen(0); }} aria-label="بحث في الأسئلة" />
        <div className="mb-8 flex flex-wrap gap-2">
          {cats.map((c) => <button key={c} onClick={() => { setCat(c); setOpen(0); }} className={`badge ${cat === c ? "badge-sky bg-sky/15" : ""}`}>{c}</button>)}
        </div>
        <div className="space-y-3">
          {list.map((f, i) => (
            <div key={f.q} className="card">
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-4 p-5 text-start font-semibold">
                <span className="font-serif text-lg text-sky-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">{f.q}</span>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-sky-2 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className="acc" data-open={open === i}>
                <div><p className="px-5 pb-5 leading-8 text-mist/80 md:pr-14">{f.a}</p></div>
              </div>
            </div>
          ))}
          {!list.length && <p className="card p-8 text-center text-mist/70">لا توجد نتيجة لهذا البحث. اسألنا مباشرة على واتساب.</p>}
        </div>
      </div>
      <aside className="card glow h-fit p-7 lg:sticky lg:top-28">
        <h3 className="text-xl font-bold">لم تجد إجابتك؟</h3>
        <p className="mt-3 leading-8 text-mist/75">اكتب لنا سؤالك على واتساب ونرد خلال ساعات العمل.</p>
        <a href={waLink(site.whatsapp, "السلام عليكم، لدي سؤال: ")} target="_blank" rel="noopener" className="btn btn-primary mt-6 w-full justify-center">اسأل على واتساب</a>
        <p className="mt-5 text-xs text-mist/50">{site.hours}</p>
      </aside>
    </div>
  );
}
