"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useContent } from "./ContentProvider";
import { Icon } from "./Icons";
import type { Country } from "@/lib/types";

const GROUPS = ["الكل", "شنغن", "للمقيمين", "وجهات أخرى"];
export const inGroup = (c: Country, g: string) => g === "الكل" || (g === "وجهات أخرى" ? !c.group : c.group === g);

/** "Where do you want to go?": searchable list of destinations. Bottom sheet on phones, centred dialog on desktop. */
function Picker({ onPick, onClose }: { onPick: (c: Country) => void; onClose: () => void }) {
  const { countries } = useContent();
  const lenis = useLenis();
  const [q, setQ] = useState("");
  const [g, setG] = useState("الكل");
  useEffect(() => {
    lenis?.stop();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => { lenis?.start(); window.removeEventListener("keydown", key); };
  }, [lenis, onClose]);
  const list = countries.filter((c) => inGroup(c, g) && `${c.name} ${c.en}`.toLowerCase().includes(q.trim().toLowerCase()));
  return createPortal(
    <div className="picker" role="dialog" aria-modal="true" aria-label="اختر الوجهة" onClick={onClose}>
      <div className="picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">أين تريد السفر؟</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl leading-none">×</button>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الدولة…" aria-label="ابحث باسم الدولة" className="field mt-4" />
        <div className="rail mt-3 flex gap-2 overflow-x-auto pb-1">
          {GROUPS.map((x) => <button key={x} type="button" onClick={() => setG(x)} aria-pressed={g === x} className={`badge shrink-0 ${g === x ? "badge-sky bg-sky/15" : ""}`}>{x}</button>)}
        </div>
        <div className="picker-list" data-lenis-prevent>
          {list.map((c) => (
            <button key={c.slug} type="button" onClick={() => onPick(c)} className="picker-item">
              <span className={`fi fi-${c.code}`} />
              <span className="flex-1 text-start"><b>{c.name}</b><small>{c.en}</small></span>
              {c.group && <span className="badge text-[11px]">{c.group}</span>}
            </button>
          ))}
          {!list.length && <p className="p-4 text-sm text-mist/70">لا توجد وجهة بهذا الاسم. راسلنا وسنساعدك.</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Hero search: pick the service, the destination and the visa type, then go straight to the application form. */
export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<"visa" | "hotel">("visa");
  const [open, setOpen] = useState(false);
  const [dest, setDest] = useState<Country | null>(null);
  const [type, setType] = useState("");
  const [h, setH] = useState({ city: "", inn: "", out: "", guests: "2" });
  const goVisa = () => {
    if (!dest) { setOpen(true); return; }
    router.push(`/apply?dest=${dest.slug}${type ? `&type=${encodeURIComponent(type)}` : ""}`);
  };
  const goHotel = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/apply?${new URLSearchParams({ service: "hotel", city: h.city, in: h.inn, out: h.out, guests: h.guests })}`);
  };
  return (
    <div className="hs beam">
      <div className="hs-tabs" role="tablist" aria-label="الخدمة">
        <button type="button" role="tab" aria-selected={tab === "visa"} onClick={() => setTab("visa")} className={`hs-tab ${tab === "visa" ? "is-on" : ""}`}>تأشيرات</button>
        <button type="button" role="tab" aria-selected={tab === "hotel"} onClick={() => setTab("hotel")} className={`hs-tab ${tab === "hotel" ? "is-on" : ""}`}>فنادق</button>
      </div>
      {tab === "visa" ? (
        <div className="hs-bar">
          <button type="button" onClick={() => setOpen(true)} className="hs-field">
            <span className="hs-label">الوجهة</span>
            <span className="hs-value">{dest ? <><span className={`fi fi-${dest.code} rounded-sm`} />{dest.name}</> : "اختر الوجهة"}</span>
          </button>
          <label className="hs-field">
            <span className="hs-label">نوع التأشيرة</span>
            <select value={type} onChange={(e) => setType(e.target.value)} disabled={!dest} className="hs-select">
              {dest ? dest.types.map((t) => <option key={t}>{t}</option>) : <option value="">اختر الوجهة أولاً</option>}
            </select>
          </label>
          <button type="button" onClick={goVisa} className="btn btn-primary hs-go">قدّم الآن <Icon name="arrow" className="h-5 w-5" /></button>
        </div>
      ) : (
        <form onSubmit={goHotel} className="hs-bar hs-hotel">
          <label className="hs-field"><span className="hs-label">المدينة أو الوجهة</span><input required value={h.city} onChange={(e) => setH({ ...h, city: e.target.value })} placeholder="مثال: باريس" className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">الوصول</span><input required type="date" value={h.inn} onChange={(e) => setH({ ...h, inn: e.target.value })} className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">المغادرة</span><input required type="date" min={h.inn} value={h.out} onChange={(e) => setH({ ...h, out: e.target.value })} className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">النزلاء</span><select value={h.guests} onChange={(e) => setH({ ...h, guests: e.target.value })} className="hs-select">{["1", "2", "3", "4", "5", "6+"].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button type="submit" className="btn btn-primary hs-go">اطلب عرضاً <Icon name="arrow" className="h-5 w-5" /></button>
        </form>
      )}
      {open && <Picker onPick={(c) => { setDest(c); setType(c.types[0] ?? ""); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}
