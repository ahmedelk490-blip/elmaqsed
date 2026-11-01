"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContent } from "./ContentProvider";
import { TIMES, TRIP_LENGTHS, waLink } from "@/lib/types";
import { submitBooking } from "@/lib/submit";
import PriceNote from "./PriceNote";
import Counter from "./Counter";
import PlaceInput from "./PlaceInput";
import DateInput from "./DateInput";
import { esimPlaces } from "@/lib/places";
import NationalitySelect from "./NationalitySelect";

const HOTEL_CITIES = ["الرياض", "جدة", "مكة المكرمة", "دبي", "باريس", "لندن", "إسطنبول", "القاهرة"];
const STEPS = { visa: ["تفاصيل الرحلة", "تفاصيل المسافرين", "المراجعة والإرسال"], hotel: ["تفاصيل الإقامة", "بياناتك", "المراجعة والإرسال"], esim: ["تفاصيل الشريحة", "بياناتك", "المراجعة والإرسال"], transfer: ["تفاصيل الانتقال", "بياناتك", "المراجعة والإرسال"], car: ["تفاصيل السيارة", "بياناتك", "المراجعة والإرسال"], train: ["تفاصيل الرحلة", "بياناتك", "المراجعة والإرسال"] };
type Service = keyof typeof STEPS;
type Row = [string, string];
const SERVICES: [Service, string][] = [["visa", "تأشيرة"], ["hotel", "فندق"], ["transfer", "انتقال"], ["car", "سيارة"], ["train", "قطار"], ["esim", "eSIM"]];
const INTRO: Record<Service, string> = { visa: "أرغب في حجز تأشيرة.", hotel: "أرغب في حجز فندق.", esim: "أرغب في طلب شريحة eSIM.", transfer: "أرغب في حجز انتقال (توصيل).", car: "أرغب في استئجار سيارة.", train: "أرغب في حجز تذاكر قطار." };
const TimeSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => <select className="field" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)}>{TIMES.map((x) => <option key={x}>{x}</option>)}</select>;

/** Re-mounts the form when the query changes (e.g. another destination picked on the booking page). */
export default function ApplyFlow() {
  const sp = useSearchParams();
  return <Flow key={sp.toString()} sp={sp} />;
}

/** Request in three steps. Visas: trip details, travellers, review. Hotels, transfers, car rental, trains and eSIM: what is needed, contact, review. The last step saves the request and opens a ready WhatsApp message. */
function Flow({ sp }: { sp: { get(name: string): string | null } }) {
  const { countries, site, esim: simDests = [] } = useContent();
  const first = countries.find((c) => c.slug === sp.get("dest"));
  const asked = sp.get("service");
  const [service, setService] = useState<Service>(asked && asked !== "visa" && asked in STEPS ? (asked as Service) : "visa");
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState<false | "ok" | "fail">(false);
  const [busy, setBusy] = useState(false);
  const [dest, setDest] = useState(first?.slug ?? "");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const count = (k: string, fallback: number) => { const n = parseInt(sp.get(k) ?? "", 10); return Number.isFinite(n) ? Math.min(20, Math.max(0, n)) : fallback; };
  const [adults, setAdults] = useState(Math.max(1, count("adults", service === "hotel" ? 2 : 1)));
  const [kids, setKids] = useState(count("kids", 0));
  const [infants, setInfants] = useState(count("infants", 0)); // under two: priced differently from children, so counted apart
  const [names, setNames] = useState<string[]>([]);
  const [h, setH] = useState({ city: sp.get("city") ?? "", inn: sp.get("in") ?? "", out: sp.get("out") ?? "", rooms: 1, stars: "لا يهم" });
  const [sim, setSim] = useState({ country: sp.get("country") ?? "", start: "", days: TRIP_LENGTHS[Number(sp.get("days"))] ?? TRIP_LENGTHS[0], qty: Math.max(1, count("qty", 1)) });
  const [r, setR] = useState({ round: !!sp.get("rd"), from: sp.get("from") ?? "", to: sp.get("to") ?? "", d: sp.get("d") ?? "", t: sp.get("t") ?? "12:00", rd: sp.get("rd") ?? "", rt: sp.get("rt") ?? "12:00", pax: Math.max(1, count("pax", 1)) });
  const [car, setCar] = useState({ from: sp.get("from") ?? "", to: sp.get("to") ?? "", d: sp.get("d") ?? "", t: sp.get("t") ?? "12:00", rd: sp.get("rd") ?? "", rt: sp.get("rt") ?? "12:00", age: !sp.get("age"), years: sp.get("age") ?? "25", res: sp.get("res") ?? "" });
  const [p, setP] = useState({ name: "", phone: "", email: "", nationality: "", status: first?.group === "للمقيمين" ? "مقيم" : "مواطن", refused: "لا", notes: "" });
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const onP = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP((x) => ({ ...x, [k]: e.target.value }));

  const c = countries.find((x) => x.slug === dest);
  const visa = service === "visa", esim = service === "esim", isRide = service === "transfer" || service === "train", isCar = service === "car";
  const train = service === "train";
  const appointment = !!c && !c.kind.includes("إلكترون");
  const total = adults + kids;
  const travellers = Array.from({ length: total }, (_, i) => names[i] ?? "");
  const steps = STEPS[service];
  const ok0 = visa ? !!c && !!date && (!appointment || !!city.trim()) : esim ? !!sim.country.trim()
    : isRide ? !!(r.from.trim() && r.to.trim() && r.d && (!r.round || r.rd))
    : isCar ? !!(car.from.trim() && car.d && car.rd && (car.age || Number(car.years) >= 18)) : !!(h.city.trim() && h.inn && h.out);
  const ok1 = !!p.phone.trim() && (visa ? travellers.every((n) => n.trim()) : !!p.name.trim());
  const people = `${adults} بالغ${kids ? ` + ${kids} طفل` : ""}`;

  const base: Row[] = visa
    ? [["الوجهة", c?.name ?? ""], ["نوع التأشيرة", c?.types[0] ?? "سياحية"], ["تاريخ السفر المتوقع", date], ...(appointment ? [["مدينة الموعد", city] as Row] : []), ["المسافرون", people]]
    : esim
      ? [["وجهة السفر", sim.country], ["تاريخ السفر", sim.start || "غير محدد"], ["مدة السفر", sim.days], ["عدد الشرائح", String(sim.qty)]]
      : [["مكان الإقامة", h.city], ["الوصول", h.inn], ["المغادرة", h.out], ["البالغون", String(adults)], ["الأطفال", String(kids)], ["الرضّع (أقل من سنتين)", String(infants)], ["الغرف", String(h.rooms)], ["تصنيف الفندق", h.stars]];
  const trip: Row[] = isRide
    ? [["نوع الرحلة", r.round ? "ذهاب وعودة" : "اتجاه واحد"], [train ? "من" : "نقطة الانطلاق", r.from], ["إلى", r.to], ["الذهاب", `${r.d} · ${r.t}`], ...(r.round ? [["العودة", `${r.rd} · ${r.rt}`] as Row] : []), ["الركاب", String(r.pax)]]
    : isCar
      ? [["مكان الاستلام", car.from], ["مكان التسليم", car.to.trim() || "نفس مكان الاستلام"], ["الاستلام", `${car.d} · ${car.t}`], ["التسليم", `${car.rd} · ${car.rt}`], ["عمر السائق", car.age ? "بين 26 و69 سنة" : `${car.years} سنة`], ["إقامة السائق", car.res || "غير محدد"]]
      : base;
  const contact: Row[] = [...(visa ? [] : [["الاسم", p.name] as Row]), ["الجوال", p.phone], ...(p.email.trim() ? [["البريد", p.email.trim()] as Row] : []), ...(esim ? [] : [["الجنسية", p.nationality || "غير محدد"] as Row, ["الصفة", p.status] as Row]), ...(visa ? [["تأشيرة سابقة", p.refused] as Row] : []), ...(p.notes.trim() ? [["ملاحظات", p.notes.trim()] as Row] : [])];
  const lines = [`السلام عليكم، ${INTRO[service]}`, ...trip.map(([k, v]) => `${k}: ${v}`), ...(visa ? travellers.map((n, i) => `${i + 1}) ${n}${i >= adults ? " (طفل)" : ""}`) : []), ...contact.map(([k, v]) => `${k}: ${v}`)];
  const message = lines.join("\n");
  // WhatsApp opens at once (it must happen inside the click); the request is then saved for the dashboard and the visitor is told whether that worked
  const send = async () => {
    window.open(waLink(site.whatsapp, message), "_blank", "noopener");
    setBusy(true);
    const ok = await submitBooking({
      service, name: visa ? travellers[0] : p.name, phone: p.phone, email: p.email, summary: isRide ? `${train ? "قطار" : "انتقال"}: ${r.from} إلى ${r.to}` : isCar ? `سيارة: ${car.from}` : visa ? `تأشيرة ${c?.name ?? ""}` : esim ? `eSIM: ${sim.country}` : `فندق: ${h.city}`,
      rows: [...trip, ...(visa ? travellers.map((n, i) => [`المسافر ${i + 1}`, `${n}${i >= adults ? " (طفل)" : ""}`] as Row) : []), ...contact],
    });
    setBusy(false);
    setSent(ok ? "ok" : "fail");
  };

  if (sent) {
    const ok = sent === "ok";
    return (
      <div id="form" className="card min-w-0 scroll-mt-28 p-7 text-center md:p-10">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl text-white ${ok ? "bg-sky" : "bg-amber-500"}`}>{ok ? "✓" : "!"}</span>
        <h3 className="mt-5 text-2xl font-bold">{ok ? "تم استلام طلبك" : "لم يكتمل تسجيل الطلب"}</h3>
        <p className="mx-auto mt-3 max-w-md leading-8 text-mist/80">{ok ? "سجّلنا طلبك وسنتواصل معك خلال 24 ساعة. إذا لم يفتح واتساب تلقائياً يمكنك فتحه من الزر." : "تعذّر حفظ طلبك الآن. أرسله لنا عبر واتساب من الزر ليصلنا فوراً، أو أعد المحاولة."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={waLink(site.whatsapp, message)} target="_blank" rel="noopener" className="btn btn-primary">{ok ? "فتح واتساب" : "إرسال عبر واتساب"}</a>
          {ok
            ? <button type="button" onClick={() => { setSent(false); setStep(0); }} className="btn btn-ghost">طلب جديد</button>
            : <button type="button" onClick={() => setSent(false)} className="btn btn-ghost">إعادة المحاولة</button>}
        </div>
      </div>
    );
  }

  return (
    <div id="form" className="card min-w-0 scroll-mt-28 p-5 md:p-9">
      <div className="mb-6 flex items-center gap-4">
        <span className="bk-ring" style={{ "--p": (step + 1) / 3 } as React.CSSProperties}>{step + 1}/3</span>
        <div>
          <p className="text-lg font-bold text-sky-2">{steps[step]}</p>
          <p className="text-sm text-mist/70">{step < 2 ? `التالي: ${steps[step + 1]}` : "آخر خطوة قبل الإرسال"}</p>
        </div>
      </div>

      {step === 0 && (
        <div>
          <div className="hs-tabs" role="tablist" aria-label="الخدمة">
            {SERVICES.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={service === k} onClick={() => setService(k)} className={`hs-tab ${service === k ? "is-on" : ""}`}>{l}</button>)}
          </div>
          {visa ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>الوجهة</span>
                  <select className="field" value={dest} onChange={(e) => setDest(e.target.value)}>
                    <option value="">اختر الوجهة</option>
                    {["شنغن", "", "للمقيمين"].map((g) => (
                      <optgroup key={g || "other"} label={g || "وجهات أخرى"}>
                        {countries.filter((x) => (x.group ?? "") === g).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label className="fl"><span>نوع التأشيرة</span><input className="field" readOnly value={c?.types[0] ?? "سياحية"} /></label>
              </div>
              <h3 className="mt-7 text-lg font-bold">ما هو التاريخ المتوقع للسفر؟</h3>
              <p className="mt-1 text-sm leading-7 text-mist/75">يمكنك تقديم الطلب الآن، ونجهّز المستندات معك قبل الموعد.</p>
              <DateInput className="mt-3 sm:max-w-xs" min={today} value={date} onChange={setDate} ariaLabel="التاريخ المتوقع للسفر" />
              {c && (appointment ? (
                <>
                  <h3 className="mt-7 text-lg font-bold">أين تريد حجز موعدك؟</h3>
                  <p className="mt-1 text-sm leading-7 text-mist/75">الحضور الشخصي مطلوب لأخذ البصمة أو المقابلة.</p>
                  <PlaceInput className="field mt-3 sm:max-w-sm" value={city} onChange={setCity} placeholder="اكتب مدينتك، مثل: الرياض، دبي، القاهرة" />
                </>
              ) : <p className="bk-info mt-7">تأشيرة {c.name} إلكترونية: لا تحتاج موعداً ولا زيارة سفارة.</p>)}
              <h3 className="mt-7 text-lg font-bold">كم عدد المسافرين؟</h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Counter label="بالغون" value={adults} min={1} onChange={setAdults} />
                <Counter label="أطفال" value={kids} min={0} onChange={setKids} />
              </div>
            </>
          ) : isRide ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                {([[false, "اتجاه واحد"], [true, "ذهاب وعودة"]] as const).map(([v, l]) => <button key={l} type="button" onClick={() => setR({ ...r, round: v })} aria-pressed={r.round === v} className={`badge ${r.round === v ? "badge-sky bg-sky/15" : ""}`}>{l}</button>)}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{train ? "من" : "نقطة الانطلاق"}</span><PlaceInput className="field" value={r.from} onChange={(v) => setR({ ...r, from: v })} placeholder={train ? "المدينة أو محطة القطار" : "مطار أو فندق أو عنوان"} /></label>
                <label className="fl"><span>إلى</span><PlaceInput className="field" value={r.to} onChange={(v) => setR({ ...r, to: v })} placeholder={train ? "المدينة أو محطة القطار" : "مطار أو فندق أو عنوان"} /></label>
                <label className="fl"><span>تاريخ الذهاب</span><DateInput min={today} value={r.d} onChange={(v) => setR({ ...r, d: v })} ariaLabel="تاريخ الذهاب" /></label>
                <label className="fl"><span>الوقت</span><TimeSelect value={r.t} onChange={(v) => setR({ ...r, t: v })} /></label>
                {r.round && <label className="fl"><span>تاريخ العودة</span><DateInput min={r.d || today} value={r.rd} onChange={(v) => setR({ ...r, rd: v })} ariaLabel="تاريخ العودة" /></label>}
                {r.round && <label className="fl"><span>وقت العودة</span><TimeSelect value={r.rt} onChange={(v) => setR({ ...r, rt: v })} /></label>}
                <div className="self-end"><Counter label="الركاب" value={r.pax} min={1} onChange={(n) => setR({ ...r, pax: n })} /></div>
              </div>
            </>
          ) : isCar ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>مكان الاستلام</span><PlaceInput className="field" value={car.from} onChange={(v) => setCar({ ...car, from: v })} placeholder="المطار أو محطة القطار أو المدينة" /></label>
                <label className="fl"><span>مكان التسليم (اختياري)</span><PlaceInput className="field" value={car.to} onChange={(v) => setCar({ ...car, to: v })} placeholder="نفس مكان الاستلام" /></label>
                <label className="fl"><span>تاريخ الاستلام</span><DateInput min={today} value={car.d} onChange={(v) => setCar({ ...car, d: v })} ariaLabel="تاريخ الاستلام" /></label>
                <label className="fl"><span>وقت الاستلام</span><TimeSelect value={car.t} onChange={(v) => setCar({ ...car, t: v })} /></label>
                <label className="fl"><span>تاريخ التسليم</span><DateInput min={car.d || today} value={car.rd} onChange={(v) => setCar({ ...car, rd: v })} ariaLabel="تاريخ التسليم" /></label>
                <label className="fl"><span>وقت التسليم</span><TimeSelect value={car.rt} onChange={(v) => setCar({ ...car, rt: v })} /></label>
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-2.5 font-semibold"><input type="checkbox" className="h-[1.1rem] w-[1.1rem]" style={{ accentColor: "#2e94d2" }} checked={car.age} onChange={(e) => setCar({ ...car, age: e.target.checked })} />عمر السائق بين 26 و69 سنة</label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {!car.age && <label className="fl"><span>عمر السائق</span><input className="field" type="number" inputMode="numeric" min={18} max={99} value={car.years} onChange={(e) => setCar({ ...car, years: e.target.value })} /></label>}
                <label className="fl"><span>بلد إقامة السائق</span><NationalitySelect className="field" prompt="اختر الدولة" value={car.res} onChange={(e) => setCar({ ...car, res: e.target.value })} /></label>
              </div>
            </>
          ) : esim ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>وجهة السفر</span><PlaceInput className="field" value={sim.country} onChange={(v) => setSim({ ...sim, country: v })} places={esimPlaces(simDests)} placeholder="اكتب اسم الدولة" /></label>
                <label className="fl"><span>تاريخ السفر (اختياري)</span><DateInput min={today} value={sim.start} onChange={(v) => setSim({ ...sim, start: v })} ariaLabel="تاريخ السفر" /></label>
                <label className="fl"><span>مدة السفر</span>
                  <select className="field" value={sim.days} onChange={(e) => setSim({ ...sim, days: e.target.value })}>{TRIP_LENGTHS.map((d) => <option key={d}>{d}</option>)}</select>
                </label>
                <div className="self-end"><Counter label="عدد الشرائح" value={sim.qty} min={1} onChange={(n) => setSim({ ...sim, qty: n })} /></div>
              </div>
              <p className="bk-info mt-5">شريحة eSIM تعمل على الجوالات التي تدعمها فقط. تأكد من جوالك قبل الطلب، أو اسألنا ونتحقق معك.</p>
            </>
          ) : (
            <>
              <label className="fl mt-2"><span>مكان الإقامة</span><PlaceInput className="field" value={h.city} onChange={(v) => setH({ ...h, city: v })} placeholder="اكتب مدينة أو دولة أو اسم الفندق" /></label>
              <div className="rail mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {HOTEL_CITIES.map((x) => <button key={x} type="button" onClick={() => setH({ ...h, city: x })} aria-pressed={h.city === x} className={`badge shrink-0 ${h.city === x ? "badge-sky bg-sky/15" : ""}`}>{x}</button>)}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>تاريخ الوصول</span><DateInput min={today} value={h.inn} onChange={(v) => setH({ ...h, inn: v })} ariaLabel="تاريخ الوصول" /></label>
                <label className="fl"><span>تاريخ المغادرة</span><DateInput min={h.inn || today} value={h.out} onChange={(v) => setH({ ...h, out: v })} ariaLabel="تاريخ المغادرة" /></label>
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <Counter label="بالغون" value={adults} min={1} onChange={setAdults} />
                <Counter label="أطفال" hint="2 – 11 سنة" value={kids} min={0} onChange={setKids} />
                <Counter label="رضّع" hint="دون سنتين" value={infants} min={0} onChange={setInfants} />
                <Counter label="غرف" value={h.rooms} min={1} onChange={(n) => setH({ ...h, rooms: n })} />
              </div>
              <label className="fl mt-5 sm:max-w-xs"><span>تصنيف الفندق</span>
                <select className="field" value={h.stars} onChange={(e) => setH({ ...h, stars: e.target.value })}>{["لا يهم", "3 نجوم", "4 نجوم", "5 نجوم"].map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            </>
          )}
          <button type="button" disabled={!ok0} onClick={() => setStep(1)} className="btn btn-primary mt-8 w-full justify-center disabled:opacity-40 sm:w-auto">حفظ واستمرار</button>
        </div>
      )}

      {step === 1 && (
        <div>
          {visa ? (
            <>
              <h3 className="text-lg font-bold">أسماء المسافرين</h3>
              <p className="mt-1 text-sm leading-7 text-mist/75">اكتب الاسم كما في جواز السفر.</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {travellers.map((n, i) => (
                  <label key={i} className="fl"><span>{i === 0 ? "المسافر الأول (مقدّم الطلب)" : `المسافر ${i + 1}${i >= adults ? " (طفل)" : ""}`}</span>
                    <input className="field" value={n} onChange={(e) => setNames(travellers.map((v, k) => (k === i ? e.target.value : v)))} autoComplete={i === 0 ? "name" : "off"} />
                  </label>
                ))}
              </div>
              <h3 className="mt-7 text-lg font-bold">بيانات التواصل</h3>
            </>
          ) : <h3 className="text-lg font-bold">بيانات التواصل</h3>}
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {!visa && <label className="fl"><span>الاسم الكامل</span><input className="field" value={p.name} onChange={onP("name")} autoComplete="name" /></label>}
            <label className="fl"><span>رقم الجوال</span><input className="field" type="tel" dir="ltr" value={p.phone} onChange={onP("phone")} autoComplete="tel" placeholder="05xxxxxxxx" /></label>
            <label className="fl"><span>البريد الإلكتروني (اختياري)</span><input className="field" type="email" dir="ltr" value={p.email} onChange={onP("email")} autoComplete="email" /></label>
            {!esim && (
              <>
                <label className="fl"><span>الجنسية</span><NationalitySelect className="field" value={p.nationality} onChange={onP("nationality")} /></label>
                <label className="fl"><span>الصفة</span><select className="field" value={p.status} onChange={onP("status")}>{["مواطن", "مقيم", "زائر"].map((s) => <option key={s}>{s}</option>)}</select></label>
              </>
            )}
            {visa && (
              <label className="fl"><span>هل يوجد لديك تأشيرة سابقة؟</span>
                <select className="field" value={p.refused} onChange={onP("refused")}><option value="لا">لا</option><option value="نعم">نعم، لدي تأشيرة سابقة</option></select>
              </label>
            )}
            <label className="fl sm:col-span-2"><span>ملاحظات (اختياري)</span><textarea className="field" rows={3} value={p.notes} onChange={onP("notes")} /></label>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn btn-ghost">رجوع</button>
            <button type="button" disabled={!ok1} onClick={() => setStep(2)} className="btn btn-primary flex-1 justify-center disabled:opacity-40 sm:flex-none">حفظ واستمرار</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <dl className="grid grid-cols-2 gap-3">
            {trip.map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/60">{k}</dt><dd className="mt-1 break-words font-semibold">{v || "غير محدد"}</dd></div>)}
          </dl>
          {visa && (
            <div className="mt-3 rounded-xl bg-white/[.04] p-3 text-sm">
              <p className="text-mist/60">المسافرون</p>
              <ol className="mt-1 space-y-1 font-semibold">{travellers.map((n, i) => <li key={i}>{i + 1}) {n}{i >= adults ? " (طفل)" : ""}</li>)}</ol>
            </div>
          )}
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {contact.map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/60">{k}</dt><dd className="mt-1 break-words font-semibold" dir="auto">{v}</dd></div>)}
          </dl>
          {visa && <PriceNote price={c?.price} includes={site.priceIncludes} excludes={site.priceExcludes} className="mt-5" />}
          <p className="mt-5 text-sm leading-7 text-mist/75">بعد الإرسال يصلنا طلبك على واتساب، ونرد خلال 24 ساعة بالمتطلبات والسعر النهائي قبل أي التزام.</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">تعديل</button>
            <button type="button" onClick={send} disabled={busy} className="btn btn-primary flex-1 justify-center disabled:opacity-60 sm:flex-none">{busy ? "جارٍ الإرسال…" : "تأكيد وإرسال الطلب"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
