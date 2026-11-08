"use client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useContent, useLang, useT } from "./ContentProvider";
import { Icon } from "./Icons";
import { TIMES, TRIP_LENGTHS, TRIP_LENGTHS_EN, CODE_EN, waLink, type Country } from "@/lib/types";
import Counter from "./Counter";
import PlaceInput from "./PlaceInput";
import { esimPlaces } from "@/lib/places";
import NationalitySelect from "./NationalitySelect";

const GROUPS = ["الكل", "شنغن", "للمقيمين", "وجهات أخرى"];
export const inGroup = (c: { group?: string }, g: string) => g === "الكل" || (g === "وجهات أخرى" ? !c.group : c.group === g);
const TABS = [["visa", "تأشيرات", "Visas"], ["hotel", "فنادق", "Hotels"], ["transfer", "انتقالات", "Transfers"], ["car", "تأجير سيارات", "Car rental"], ["train", "تذاكر قطار", "Train tickets"], ["esim", "eSIM", "eSIM"], ["pack", "بكجات", "Packages"]] as const;
const paxLabel = (n: number, en: boolean) => en ? `${n} ${n === 1 ? "passenger" : "passengers"}` : `${n} ${n === 1 ? "راكب" : n === 2 ? "راكبان" : n <= 10 ? "ركاب" : "راكباً"}`;
type Ride = { round: boolean; from: string; to: string; d: string; t: string; rd: string; rt: string; pax: number };
const RIDE: Ride = { round: false, from: "", to: "", d: "", t: "12:00", rd: "", rt: "12:00", pax: 1 };

type PickItem = { key: string; name: string; en?: string; code?: string; group?: string };

/** Searchable list of destinations: bottom sheet on phones, centred dialog on desktop. With `onFree`, a place that is not listed can still be used. */
function Picker({ title, items, groups, onPick, onFree, onClose }: { title: string; items: PickItem[]; groups?: string[]; onPick: (key: string) => void; onFree?: (name: string) => void; onClose: () => void }) {
  const lenis = useLenis();
  const t = useT();
  const en = useLang() === "en";
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
      <div className="picker-panel on-light" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t("إغلاق", "Close")} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-xl leading-none">×</button>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={onFree ? t("ابحث أو اكتب اسم وجهتك…", "Search or type your destination…") : t("ابحث باسم الدولة…", "Search by country name…")} aria-label={t("ابحث باسم الدولة", "Search by country name")} className="field mt-4" />
        {groups && (
          <div className="rail mt-3 flex gap-2 overflow-x-auto pb-1">
            {groups.map((x) => <button key={x} type="button" onClick={() => setG(x)} aria-pressed={g === x} className={`badge shrink-0 ${g === x ? "badge-sky bg-sky/15" : ""}`}>{en ? CODE_EN[x] ?? x : x}</button>)}
          </div>
        )}
        <div className="picker-list" data-lenis-prevent>
          {list.map((c) => (
            <button key={c.key} type="button" onClick={() => onPick(c.key)} className="picker-item">
              {c.code && <span className={`fi fi-${c.code}`} />}
              <span className="flex-1 text-start"><b>{c.name}</b>{!en && c.en && <small>{c.en}</small>}</span>
              {c.group && <span className="badge text-xs">{en ? CODE_EN[c.group] ?? c.group : c.group}</span>}
            </button>
          ))}
          {onFree && term && !list.some((c) => c.name === term) && (
            <button type="button" onClick={() => onFree(term)} className="picker-item">
              <Icon name="pin" className="h-6 w-6 shrink-0 text-sky-2" />
              <span className="flex-1 text-start"><b>{term}</b><span className="mt-0.5 block text-xs text-mist/65">{t("وجهة غير موجودة في القائمة؟ اطلبها وسنرد عليك", "Destination not listed? Request it and we will get back to you")}</span></span>
            </button>
          )}
          {!list.length && !onFree && <p className="p-4 text-sm text-mist/70">{t("لا توجد وجهة بهذا الاسم. راسلنا وسنساعدك.", "No destination with this name. Message us and we will help.")}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const dayMonthFor = (en: boolean) => new Intl.DateTimeFormat(en ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long" });

/** A date field that reads as text ("اختر التاريخ", then "12 ديسمبر"); the real date input lies invisibly on top, so a tap still opens the native picker. */
function DateField({ label, value, min, onChange, className = "" }: { label: string; value: string; min?: string; onChange: (v: string) => void; className?: string }) {
  const t = useT();
  const en = useLang() === "en";
  return (
    <label className={`hs-field hs-half hs-date ${className}`}>
      <span className="hs-label"><Icon name="calendar" className="hs-ico" />{label}</span>
      <span className={`hs-value ${value ? "" : "is-empty"}`}>{value ? dayMonthFor(en).format(new Date(`${value}T00:00:00`)) : t("اختر التاريخ", "Select date")}</span>
      <input
        required type="date" value={value} min={min} aria-label={label} className="hs-date-input"
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* the control opens by itself where showPicker is not allowed */ } }}
      />
    </label>
  );
}

/** A time of day from a short list (every half hour), read like the other fields. */
function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="hs-field hs-half">
      <span className="hs-label"><Icon name="clock" className="hs-ico" />{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="hs-select" dir="ltr">{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
    </label>
  );
}

/** One way or there and back. */
function TripType({ round, onChange }: { round: boolean; onChange: (round: boolean) => void }) {
  const t = useT();
  return (
    <div className="hs-trip" role="radiogroup" aria-label={t("نوع الرحلة", "Trip type")}>
      {([[false, t("اتجاه واحد", "One way")], [true, t("ذهاب وعودة", "Round trip")]] as const).map(([v, l]) => (
        <button key={l} type="button" role="radio" aria-checked={round === v} onClick={() => onChange(v)} className={`hs-radio ${round === v ? "is-on" : ""}`}>{l}</button>
      ))}
    </div>
  );
}

/** From and to side by side, with a button that swaps them (car rental: no swap, the drop-off may stay empty). */
function Route({ from, to, labels, placeholder, onChange, swap = true, airports }: { from: string; to: string; labels: [string, string]; placeholder: [string, string]; onChange: (from: string, to: string) => void; swap?: boolean; airports?: boolean }) {
  const t = useT();
  return (
    <div className="hs-route">
      <label className="hs-field"><span className="hs-label"><Icon name="pin" className="hs-ico" />{labels[0]}</span><PlaceInput required value={from} onChange={(v) => onChange(v, to)} airports={airports} placeholder={placeholder[0]} className="hs-input" /></label>
      {swap && <button type="button" onClick={() => onChange(to, from)} aria-label={t("تبديل الاتجاه", "Swap direction")} className="hs-swap"><Icon name="swap" className="h-4 w-4" /></button>}
      <label className="hs-field"><span className="hs-label"><Icon name="pin" className="hs-ico" />{labels[1]}</span><PlaceInput required={swap} value={to} onChange={(v) => onChange(from, v)} airports={airports} placeholder={placeholder[1]} className="hs-input" /></label>
    </div>
  );
}

/** Hero search: pick the service (visa, hotel, transfer, car rental, train, eSIM, packages), fill the few fields that matter, and land on the request form with them. */
export default function HeroSearch() {
  const t = useT();
  const en = useLang() === "en";
  const router = useRouter();
  const { site, countries, esim = [] } = useContent();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("visa");
  const [open, setOpen] = useState<"" | "visa">(""); // which destination list is open
  const close = useCallback(() => setOpen(""), []);
  const [dest, setDest] = useState<Country | null>(null);
  const [type, setType] = useState("سياحية");
  const [h, setH] = useState({ city: "", inn: "", out: "", adults: 2, kids: 0, infants: 0 });
  const [guests, setGuests] = useState(false); // the guests panel under the hotel fields
  const [sim, setSim] = useState({ country: "", days: "0", qty: "1" });
  const [tr, setTr] = useState<Ride>(RIDE);
  const [rail, setRail] = useState<Ride>(RIDE);
  const [car, setCar] = useState({ from: "", to: "", d: "", t: "12:00", rd: "", rt: "12:00", age: true, years: "25", res: "" });
  const types = dest?.types.length ? dest.types : [t("سياحية", "Tourist")]; // tourist visas only, so the field is never empty
  const people = en ? `${h.adults} ${h.adults === 1 ? "adult" : "adults"}${h.kids ? ` · ${h.kids} ${h.kids === 1 ? "child" : "children"}` : ""}${h.infants ? ` · ${h.infants} ${h.infants === 1 ? "infant" : "infants"}` : ""}` : `${h.adults} بالغ${h.kids ? ` · ${h.kids} طفل` : ""}${h.infants ? ` · ${h.infants} رضيع` : ""}`;
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
    book({ service: "esim", country: sim.country, days: sim.days, qty: sim.qty });
  };
  const goRide = (service: string, r: Ride) => (e: React.FormEvent) => {
    e.preventDefault();
    book({ service, from: r.from, to: r.to, d: r.d, t: r.t, ...(r.round ? { rd: r.rd, rt: r.rt } : {}), pax: String(r.pax) });
  };
  const goCar = (e: React.FormEvent) => {
    e.preventDefault();
    book({ service: "car", from: car.from, to: car.to, d: car.d, t: car.t, rd: car.rd, rt: car.rt, ...(car.age ? {} : { age: car.years }), res: car.res });
  };
  const ride = (service: string, r: Ride, set: (r: Ride) => void, labels: [string, string], placeholder: [string, string], go: string, airports = false) => (
    <form onSubmit={goRide(service, r)} className="hs-bar hs-x">
      <TripType round={r.round} onChange={(round) => set({ ...r, round })} />
      <div className="hs-group">
        <Route from={r.from} to={r.to} labels={labels} placeholder={placeholder} airports={airports} onChange={(from, to) => set({ ...r, from, to })} />
        <DateField label={t("تاريخ الذهاب", "Departure date")} value={r.d} onChange={(d) => set({ ...r, d })} className="hs-d" />
        <TimeField label={t("الوقت", "Time")} value={r.t} onChange={(t) => set({ ...r, t })} />
        {r.round && <DateField label={t("تاريخ العودة", "Return date")} value={r.rd} min={r.d} onChange={(rd) => set({ ...r, rd })} className="hs-d" />}
        {r.round && <TimeField label={t("الوقت", "Time")} value={r.rt} onChange={(rt) => set({ ...r, rt })} />}
        <label className="hs-field">
          <span className="hs-label"><Icon name="users" className="hs-ico" />{t("الركاب", "Passengers")}</span>
          <select value={r.pax} onChange={(e) => set({ ...r, pax: Number(e.target.value) })} className="hs-select">{Array.from({ length: 20 }, (_, i) => <option key={i} value={i + 1}>{paxLabel(i + 1, en)}</option>)}</select>
        </label>
      </div>
      <button type="submit" className="btn btn-primary hs-go">{go} <Icon name="arrow" className="h-5 w-5" /></button>
    </form>
  );
  return (
    <div className="hs on-light beam">
      <div className="hs-tabs" role="tablist" aria-label={t("الخدمة", "Service")}>
        {TABS.map(([k, ar, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`hs-tab ${tab === k ? "is-on" : ""}`}>{t(ar, label)}</button>)}
      </div>
      {tab === "visa" && (
        <div className="hs-bar">
          <div className="hs-group">
            <button type="button" onClick={() => setOpen("visa")} aria-haspopup="dialog" className="hs-field">
              <span className="hs-label"><Icon name="pin" className="hs-ico" />{t("الوجهة", "Destination")}</span>
              <span className="hs-value">{dest ? <><span className={`fi fi-${dest.code} rounded-sm`} />{dest.name}</> : t("اختر الوجهة", "Select destination")}</span>
            </button>
            <label className="hs-field">
              <span className="hs-label"><Icon name="docs" className="hs-ico" />{t("نوع التأشيرة", "Visa type")}</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="hs-select">
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={goVisa} className="btn btn-primary hs-go">{t("قدّم الآن", "Apply now")} <Icon name="arrow" className="h-5 w-5" /></button>
        </div>
      )}
      {tab === "hotel" && (
        <form onSubmit={goHotel} className="hs-bar hs-hotel">
          <div className="hs-group">
            <label className="hs-field"><span className="hs-label"><Icon name="pin" className="hs-ico" />{t("المدينة أو الوجهة", "City or destination")}</span><PlaceInput required value={h.city} onChange={(v) => setH({ ...h, city: v })} placeholder={t("اكتب مدينة أو دولة", "Type a city or country")} className="hs-input" /></label>
            <DateField label={t("الوصول", "Check-in")} value={h.inn} onChange={(v) => setH({ ...h, inn: v })} />
            <DateField label={t("المغادرة", "Check-out")} value={h.out} min={h.inn} onChange={(v) => setH({ ...h, out: v })} />
            <button type="button" onClick={() => setGuests(!guests)} aria-expanded={guests} className="hs-field hs-wide">
              <span className="hs-label"><Icon name="users" className="hs-ico" />{t("النزلاء", "Guests")}</span>
              <span className="hs-people">{people}</span>
            </button>
          </div>
          <button type="submit" className="btn btn-primary hs-go">{t("اطلب عرضاً", "Request a quote")} <Icon name="arrow" className="h-5 w-5" /></button>
          {guests && (
            <div className="hs-guests">
              <Counter label={t("بالغون", "Adults")} value={h.adults} min={1} onChange={(n) => setH({ ...h, adults: n })} />
              <Counter label={t("أطفال", "Children")} hint={t("2 – 11 سنة", "Ages 2 – 11")} value={h.kids} min={0} onChange={(n) => setH({ ...h, kids: n })} />
              <Counter label={t("رضّع", "Infants")} hint={t("دون سنتين", "Under 2")} value={h.infants} min={0} onChange={(n) => setH({ ...h, infants: n })} />
            </div>
          )}
        </form>
      )}
      {tab === "transfer" && ride("transfer", tr, setTr, [t("نقطة الانطلاق", "Pick-up point"), t("إلى", "To")], [t("مطار أو فندق أو عنوان", "Airport, hotel or address"), t("مطار أو فندق أو عنوان", "Airport, hotel or address")], t("اطلب الانتقال", "Request transfer"), true)}
      {tab === "train" && ride("train", rail, setRail, [t("من", "From"), t("إلى", "To")], [t("المدينة أو محطة القطار", "City or train station"), t("المدينة أو محطة القطار", "City or train station")], t("اطلب التذاكر", "Request tickets"))}
      {tab === "car" && (
        <form onSubmit={goCar} className="hs-bar hs-x">
          <div className="hs-group">
            <Route swap={false} airports from={car.from} to={car.to} labels={[t("مكان الاستلام", "Pick-up location"), t("مكان التسليم", "Drop-off location")]} placeholder={[t("المطار أو محطة القطار أو المدينة", "Airport, train station or city"), t("نفس مكان الاستلام", "Same as pick-up")]} onChange={(from, to) => setCar({ ...car, from, to })} />
            <DateField label={t("تاريخ الاستلام", "Pick-up date")} value={car.d} onChange={(d) => setCar({ ...car, d })} className="hs-d" />
            <TimeField label={t("الوقت", "Time")} value={car.t} onChange={(t) => setCar({ ...car, t })} />
            <DateField label={t("تاريخ التسليم", "Drop-off date")} value={car.rd} min={car.d} onChange={(rd) => setCar({ ...car, rd })} className="hs-d" />
            <TimeField label={t("الوقت", "Time")} value={car.rt} onChange={(rt) => setCar({ ...car, rt })} />
          </div>
          <div className="hs-extra">
            <label className="hs-check"><input type="checkbox" checked={car.age} onChange={(e) => setCar({ ...car, age: e.target.checked })} />{t("عمر السائق بين 26 و69 سنة", "Driver aged 26 to 69")}</label>
            {!car.age && <label className="hs-mini">{t("عمر السائق", "Driver age")}<input type="number" inputMode="numeric" min={18} max={99} required value={car.years} onChange={(e) => setCar({ ...car, years: e.target.value })} /></label>}
            <label className="hs-mini">{t("إقامة السائق", "Driver residence")}<NationalitySelect prompt={t("اختر الدولة", "Select country")} value={car.res} onChange={(e) => setCar({ ...car, res: e.target.value })} /></label>
          </div>
          <button type="submit" className="btn btn-primary hs-go">{t("اطلب سيارتك", "Request your car")} <Icon name="arrow" className="h-5 w-5" /></button>
        </form>
      )}
      {tab === "esim" && (
        <form onSubmit={goEsim} className="hs-bar hs-esim">
          <div className="hs-group">
            <label className="hs-field"><span className="hs-label"><Icon name="pin" className="hs-ico" />{t("وجهة السفر", "Travel destination")}</span><PlaceInput required value={sim.country} onChange={(v) => setSim({ ...sim, country: v })} places={esimPlaces(esim)} placeholder={t("اكتب اسم الدولة", "Type the country name")} className="hs-input" /></label>
            <label className="hs-field hs-half"><span className="hs-label"><Icon name="clock" className="hs-ico" />{t("مدة السفر", "Trip length")}</span><select value={sim.days} onChange={(e) => setSim({ ...sim, days: e.target.value })} className="hs-select">{TRIP_LENGTHS.map((d, i) => <option key={d} value={i}>{en ? TRIP_LENGTHS_EN[i] ?? d : d}</option>)}</select></label>
            <label className="hs-field hs-half"><span className="hs-label"><Icon name="sim" className="hs-ico" />{t("عدد الشرائح", "Number of SIMs")}</span><select value={sim.qty} onChange={(e) => setSim({ ...sim, qty: e.target.value })} className="hs-select">{Array.from({ length: 10 }, (_, i) => <option key={i}>{i + 1}</option>)}</select></label>
          </div>
          <button type="submit" className="btn btn-primary hs-go">{t("اطلب شريحتك", "Request your eSIM")} <Icon name="arrow" className="h-5 w-5" /></button>
        </form>
      )}
      {tab === "pack" && (
        <div className="hs-bar hs-soon">
          <div className="hs-group"><p className="hs-field"><span className="hs-label"><Icon name="compass" className="hs-ico" />{t("بكجات السفر", "Travel packages")}</span><span className="hs-value">{t("قريباً", "Coming soon")}</span></p></div>
          <a href={waLink(site.whatsapp, t("السلام عليكم، أرغب في الاستفسار عن بكجات السفر.", "Hello, I would like to ask about travel packages."))} target="_blank" rel="noopener" className="btn btn-primary hs-go">{t("اسأل عن البكجات", "Ask about packages")} <Icon name="arrow" className="h-5 w-5" /></a>
        </div>
      )}
      {open === "visa" && (
        <Picker
          title={t("أين تريد السفر؟", "Where do you want to travel?")} groups={GROUPS} onClose={close}
          items={countries.map((c) => ({ key: c.slug, name: c.name, en: c.en, code: c.code, group: c.group }))}
          onPick={(k) => { const c = countries.find((x) => x.slug === k); if (c) { setDest(c); setType(c.types[0] ?? t("سياحية", "Tourist")); } close(); }}
        />
      )}
    </div>
  );
}
