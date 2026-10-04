"use client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useContent } from "./ContentProvider";
import { Icon } from "./Icons";
import { TRIP_LENGTHS, waLink, type Country } from "@/lib/types";
import Counter from "./Counter";

const GROUPS = ["الكل", "شنغن", "للمقيمين", "وجهات أخرى"];
export const inGroup = (c: { group?: string }, g: string) => g === "الكل" || (g === "وجهات أخرى" ? !c.group : c.group === g);
const TABS = [["visa", "تأشيرات"], ["hotel", "فنادق"], ["esim", "eSIM"], ["pack", "بكجات"]] as const;

type PickItem = { key: string; name: string; en?: string; code?: string; group?: string };

/** Searchable list of destinations: bottom sheet on phones, centred dialog on desktop. With `onFree`, a place that is not listed can still be used. */
function Picker({ title, items, groups, onPick, onFree, onClose }: { title: string; items: PickItem[]; groups?: string[]; onPick: (key: string) => void; onFree?: (name: string) => void; onClose: () => void }) {
  const lenis = useLenis();
  const [q, setQ] = useState("");
  const [g, setG] = useState("الكل");
  useEffect(() => {
    lenis?.stop();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => { lenis?.start(); window.removeEventListener("keydown", key); };
  }, [lenis, onClose]);
  const term = q.trim();
  const list = items.filter((c) => (!groups || inGroup(c, g)) && `${c.name} ${c.en ?? ""}`.toLowerCase().includes(term.toLowerCase()));
  return createPortal(
    <div className="picker" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl leading-none">×</button>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={onFree ? "ابحث أو اكتب اسم وجهتك…" : "ابحث باسم الدولة…"} aria-label="ابحث باسم الدولة" className="field mt-4" />
        {groups && (
          <div className="rail mt-3 flex gap-2 overflow-x-auto pb-1">
            {groups.map((x) => <button key={x} type="button" onClick={() => setG(x)} aria-pressed={g === x} className={`badge shrink-0 ${g === x ? "badge-sky bg-sky/15" : ""}`}>{x}</button>)}
          </div>
        )}
        <div className="picker-list" data-lenis-prevent>
          {list.map((c) => (
            <button key={c.key} type="button" onClick={() => onPick(c.key)} className="picker-item">
              {c.code && <span className={`fi fi-${c.code}`} />}
              <span className="flex-1 text-start"><b>{c.name}</b>{c.en && <small>{c.en}</small>}</span>
              {c.group && <span className="badge text-[11px]">{c.group}</span>}
            </button>
          ))}
          {onFree && term && !list.some((c) => c.name === term) && (
            <button type="button" onClick={() => onFree(term)} className="picker-item">
              <Icon name="pin" className="h-6 w-6 shrink-0 text-sky-2" />
              <span className="flex-1 text-start"><b>{term}</b><span className="mt-0.5 block text-xs text-mist/65">وجهة غير موجودة في القائمة؟ اطلبها وسنرد عليك</span></span>
            </button>
          )}
          {!list.length && !onFree && <p className="p-4 text-sm text-mist/70">لا توجد وجهة بهذا الاسم. راسلنا وسنساعدك.</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const dayMonth = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long" });

/** A date field that reads as text ("اختر التاريخ", then "12 ديسمبر"); the real date input lies invisibly on top, so a tap still opens the native picker. */
function DateField({ label, value, min, onChange }: { label: string; value: string; min?: string; onChange: (v: string) => void }) {
  return (
    <label className="hs-field hs-half hs-date">
      <span className="hs-label"><Icon name="calendar" className="hs-ico" />{label}</span>
      <span className={`hs-value ${value ? "" : "is-empty"}`}>{value ? dayMonth.format(new Date(`${value}T00:00:00`)) : "اختر التاريخ"}</span>
      <input
        required type="date" value={value} min={min} aria-label={label} className="hs-date-input"
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* the control opens by itself where showPicker is not allowed */ } }}
      />
    </label>
  );
}

/** Hero search: pick the service (visa, hotel, eSIM, packages), fill the few fields that matter, and land on the request form with them. */
export default function HeroSearch() {
  const router = useRouter();
  const { site, countries, esim = [] } = useContent();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("visa");
  const [open, setOpen] = useState<"" | "visa" | "esim">(""); // which destination list is open
  const close = useCallback(() => setOpen(""), []);
  const [dest, setDest] = useState<Country | null>(null);
  const [type, setType] = useState("سياحية");
  const [h, setH] = useState({ city: "", inn: "", out: "", adults: 2, kids: 0, infants: 0 });
  const [guests, setGuests] = useState(false); // the guests panel under the hotel fields
  const [sim, setSim] = useState({ country: "", days: "0", qty: "1" });
  const types = dest?.types.length ? dest.types : ["سياحية"]; // tourist visas only, so the field is never empty
  const simDest = esim.find((x) => x.name === sim.country);
  const people = `${h.adults} بالغ${h.kids ? ` · ${h.kids} طفل` : ""}${h.infants ? ` · ${h.infants} رضيع` : ""}`;
  const book = (params: Record<string, string>) => router.push(`/booking?${new URLSearchParams(params)}`);
  const goVisa = () => {
    if (!dest) { setOpen("visa"); return; }
    book({ dest: dest.slug });
  };
  const goHotel = (e: React.FormEvent) => {
    e.preventDefault();
    book({ service: "hotel", city: h.city, in: h.inn, out: h.out, adults: String(h.adults), kids: String(h.kids), infants: String(h.infants) });
  };
  const goEsim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sim.country) { setOpen("esim"); return; }
    book({ service: "esim", country: sim.country, days: sim.days, qty: sim.qty });
  };
  return (
    <div className="hs on-light beam">
      <div className="hs-tabs" role="tablist" aria-label="الخدمة">
        {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`hs-tab ${tab === k ? "is-on" : ""}`}>{label}</button>)}
      </div>
      {tab === "visa" && (
        <div className="hs-bar">
          <div className="hs-group">
            <button type="button" onClick={() => setOpen("visa")} className="hs-field">
              <span className="hs-label"><Icon name="pin" className="hs-ico" />الوجهة</span>
              <span className="hs-value">{dest ? <><span className={`fi fi-${dest.code} rounded-sm`} />{dest.name}</> : "اختر الوجهة"}</span>
            </button>
            <label className="hs-field">
              <span className="hs-label"><Icon name="docs" className="hs-ico" />نوع التأشيرة</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="hs-select">
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={goVisa} className="btn btn-primary hs-go">قدّم الآن <Icon name="arrow" className="h-5 w-5" /></button>
        </div>
      )}
      {tab === "hotel" && (
        <form onSubmit={goHotel} className="hs-bar hs-hotel">
          <div className="hs-group">
            <label className="hs-field"><span className="hs-label"><Icon name="pin" className="hs-ico" />المدينة أو الوجهة</span><input required value={h.city} onChange={(e) => setH({ ...h, city: e.target.value })} placeholder="مثال: باريس" className="hs-input" /></label>
            <DateField label="الوصول" value={h.inn} onChange={(v) => setH({ ...h, inn: v })} />
            <DateField label="المغادرة" value={h.out} min={h.inn} onChange={(v) => setH({ ...h, out: v })} />
            <button type="button" onClick={() => setGuests(!guests)} aria-expanded={guests} className="hs-field hs-wide">
              <span className="hs-label"><Icon name="users" className="hs-ico" />النزلاء</span>
              <span className="hs-people">{people}</span>
            </button>
          </div>
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
          <div className="hs-group">
            <button type="button" onClick={() => setOpen("esim")} className="hs-field">
              <span className="hs-label"><Icon name="pin" className="hs-ico" />وجهة السفر</span>
              <span className="hs-value">{sim.country ? <>{simDest && <span className={`fi fi-${simDest.code} rounded-sm`} />}{sim.country}</> : "اختر الوجهة"}</span>
            </button>
            <label className="hs-field hs-half"><span className="hs-label"><Icon name="clock" className="hs-ico" />مدة السفر</span><select value={sim.days} onChange={(e) => setSim({ ...sim, days: e.target.value })} className="hs-select">{TRIP_LENGTHS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
            <label className="hs-field hs-half"><span className="hs-label"><Icon name="sim" className="hs-ico" />عدد الشرائح</span><select value={sim.qty} onChange={(e) => setSim({ ...sim, qty: e.target.value })} className="hs-select">{Array.from({ length: 10 }, (_, i) => <option key={i}>{i + 1}</option>)}</select></label>
          </div>
          <button type="submit" className="btn btn-primary hs-go">اطلب شريحتك <Icon name="arrow" className="h-5 w-5" /></button>
        </form>
      )}
      {tab === "pack" && (
        <div className="hs-bar hs-soon">
          <div className="hs-group"><p className="hs-field"><span className="hs-label"><Icon name="compass" className="hs-ico" />بكجات السفر</span><span className="hs-value">قريباً</span></p></div>
          <a href={waLink(site.whatsapp, "السلام عليكم، أرغب في الاستفسار عن بكجات السفر.")} target="_blank" rel="noopener" className="btn btn-primary hs-go">اسأل عن البكجات <Icon name="arrow" className="h-5 w-5" /></a>
        </div>
      )}
      {open === "visa" && (
        <Picker
          title="أين تريد السفر؟" groups={GROUPS} onClose={close}
          items={countries.map((c) => ({ key: c.slug, name: c.name, en: c.en, code: c.code, group: c.group }))}
          onPick={(k) => { const c = countries.find((x) => x.slug === k); if (c) { setDest(c); setType(c.types[0] ?? "سياحية"); } close(); }}
        />
      )}
      {open === "esim" && (
        <Picker
          title="شريحة eSIM لأي وجهة؟" onClose={close}
          items={esim.map((x) => ({ key: x.name, name: x.name, en: x.en, code: x.code }))}
          onPick={(name) => { setSim({ ...sim, country: name }); close(); }}
          onFree={(name) => { setSim({ ...sim, country: name }); close(); }}
        />
      )}
    </div>
  );
}
