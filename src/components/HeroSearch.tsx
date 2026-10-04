"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useContent } from "./ContentProvider";
import { Icon } from "./Icons";
import { TRIP_LENGTHS, waLink, type Country } from "@/lib/types";
import Counter from "./Counter";

const GROUPS = ["الكل", "شنغن", "للمقيمين", "وجهات أخرى"];
export const inGroup = (c: Country, g: string) => g === "الكل" || (g === "وجهات أخرى" ? !c.group : c.group === g);
const TABS = [["visa", "تأشيرات"], ["hotel", "فنادق"], ["esim", "eSIM"], ["pack", "بكجات"]] as const;

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

/** Hero search: pick the service (visa, hotel, eSIM, packages), fill the few fields that matter, and land on the request form with them. */
export default function HeroSearch() {
  const router = useRouter();
  const { site } = useContent();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("visa");
  const [open, setOpen] = useState(false);
  const [dest, setDest] = useState<Country | null>(null);
  const [type, setType] = useState("سياحية");
  const [h, setH] = useState({ city: "", inn: "", out: "", adults: 2, kids: 0, infants: 0 });
  const [guests, setGuests] = useState(false); // the guests panel under the hotel fields
  const [sim, setSim] = useState({ country: "", days: "0", qty: "1" });
  const types = dest?.types.length ? dest.types : ["سياحية"]; // tourist visas only, so the field is never empty
  const people = `${h.adults} بالغ${h.kids ? ` · ${h.kids} طفل` : ""}${h.infants ? ` · ${h.infants} رضيع` : ""}`;
  const book = (params: Record<string, string>) => router.push(`/booking?${new URLSearchParams(params)}`);
  const goVisa = () => {
    if (!dest) { setOpen(true); return; }
    book({ dest: dest.slug });
  };
  const goHotel = (e: React.FormEvent) => {
    e.preventDefault();
    book({ service: "hotel", city: h.city, in: h.inn, out: h.out, adults: String(h.adults), kids: String(h.kids), infants: String(h.infants) });
  };
  const goEsim = (e: React.FormEvent) => {
    e.preventDefault();
    book({ service: "esim", country: sim.country, days: sim.days, qty: sim.qty });
  };
  return (
    <div className="hs on-light beam">
      <div className="hs-tabs" role="tablist" aria-label="الخدمة">
        {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`hs-tab ${tab === k ? "is-on" : ""}`}>{label}</button>)}
      </div>
      {tab === "visa" && (
        <div className="hs-bar">
          <button type="button" onClick={() => setOpen(true)} className="hs-field">
            <span className="hs-label">الوجهة</span>
            <span className="hs-value">{dest ? <><span className={`fi fi-${dest.code} rounded-sm`} />{dest.name}</> : "اختر الوجهة"}</span>
          </button>
          <label className="hs-field">
            <span className="hs-label">نوع التأشيرة</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="hs-select">
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <button type="button" onClick={goVisa} className="btn btn-primary hs-go">قدّم الآن <Icon name="arrow" className="h-5 w-5" /></button>
        </div>
      )}
      {tab === "hotel" && (
        <form onSubmit={goHotel} className="hs-bar hs-hotel">
          <label className="hs-field"><span className="hs-label">المدينة أو الوجهة</span><input required value={h.city} onChange={(e) => setH({ ...h, city: e.target.value })} placeholder="مثال: باريس" className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">الوصول</span><input required type="date" value={h.inn} onChange={(e) => setH({ ...h, inn: e.target.value })} className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">المغادرة</span><input required type="date" min={h.inn} value={h.out} onChange={(e) => setH({ ...h, out: e.target.value })} className="hs-input" /></label>
          <button type="button" onClick={() => setGuests(!guests)} aria-expanded={guests} className="hs-field hs-wide">
            <span className="hs-label">النزلاء</span>
            <span className="hs-people">{people}</span>
          </button>
          <button type="submit" className="btn btn-primary hs-go">اطلب عرضاً <Icon name="arrow" className="h-5 w-5" /></button>
          {guests && (
            <div className="hs-guests">
              <Counter label="بالغون" value={h.adults} min={1} onChange={(n) => setH({ ...h, adults: n })} />
              <Counter label="أطفال" hint="2 – 11 سنة" value={h.kids} min={0} onChange={(n) => setH({ ...h, kids: n })} />
              <Counter label="رضّع" hint="دون سنتين" value={h.infants} min={0} onChange={(n) => setH({ ...h, infants: n })} />
            </div>
          )}
        </form>
      )}
      {tab === "esim" && (
        <form onSubmit={goEsim} className="hs-bar hs-esim">
          <label className="hs-field"><span className="hs-label">وجهة السفر</span><input required value={sim.country} onChange={(e) => setSim({ ...sim, country: e.target.value })} placeholder="مثال: تركيا" className="hs-input" /></label>
          <label className="hs-field"><span className="hs-label">مدة السفر</span><select value={sim.days} onChange={(e) => setSim({ ...sim, days: e.target.value })} className="hs-select">{TRIP_LENGTHS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
          <label className="hs-field"><span className="hs-label">عدد الشرائح</span><select value={sim.qty} onChange={(e) => setSim({ ...sim, qty: e.target.value })} className="hs-select">{["1", "2", "3", "4", "5"].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button type="submit" className="btn btn-primary hs-go">اطلب شريحتك <Icon name="arrow" className="h-5 w-5" /></button>
        </form>
      )}
      {tab === "pack" && (
        <div className="hs-bar hs-soon">
          <p className="hs-field"><span className="hs-label">بكجات السفر</span><span className="hs-value">قريباً</span></p>
          <a href={waLink(site.whatsapp, "السلام عليكم، أرغب في الاستفسار عن بكجات السفر.")} target="_blank" rel="noopener" className="btn btn-primary hs-go">اسأل عن البكجات <Icon name="arrow" className="h-5 w-5" /></a>
        </div>
      )}
      {open && <Picker onPick={(c) => { setDest(c); setType(c.types[0] ?? "سياحية"); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}
