"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContent, useLang, useT } from "./ContentProvider";
import { TIMES, TRIP_LENGTHS, TRIP_LENGTHS_EN, waLink } from "@/lib/types";
import { submitBooking } from "@/lib/submit";
import PriceNote from "./PriceNote";
import Counter from "./Counter";
import PlaceInput from "./PlaceInput";
import DateInput from "./DateInput";
import { esimPlaces } from "@/lib/places";
import NationalitySelect from "./NationalitySelect";

const HOTEL_CITIES = ["الرياض", "جدة", "مكة المكرمة", "دبي", "باريس", "لندن", "إسطنبول", "القاهرة"];
const HOTEL_CITIES_EN = ["Riyadh", "Jeddah", "Makkah", "Dubai", "Paris", "London", "Istanbul", "Cairo"];
/** English for the fixed Arabic option values (values stay Arabic in state; only the shown text and the sent summary change). */
const VAL_EN: Record<string, string> = { "مواطن": "Citizen", "مقيم": "Resident", "زائر": "Visitor", "لا يهم": "Any", "3 نجوم": "3 stars", "4 نجوم": "4 stars", "5 نجوم": "5 stars", "لا": "No", "نعم": "Yes" };
const STEPS = { visa: ["تفاصيل الرحلة", "تفاصيل المسافرين", "المراجعة والإرسال"], hotel: ["تفاصيل الإقامة", "بياناتك", "المراجعة والإرسال"], esim: ["تفاصيل الشريحة", "بياناتك", "المراجعة والإرسال"], transfer: ["تفاصيل الانتقال", "بياناتك", "المراجعة والإرسال"], car: ["تفاصيل السيارة", "بياناتك", "المراجعة والإرسال"], train: ["تفاصيل الرحلة", "بياناتك", "المراجعة والإرسال"] };
const STEPS_EN = { visa: ["Trip details", "Traveller details", "Review and send"], hotel: ["Stay details", "Your details", "Review and send"], esim: ["eSIM details", "Your details", "Review and send"], transfer: ["Transfer details", "Your details", "Review and send"], car: ["Car details", "Your details", "Review and send"], train: ["Trip details", "Your details", "Review and send"] };
type Service = keyof typeof STEPS;
type Row = [string, string];
const SERVICES: [Service, string, string][] = [["visa", "تأشيرة", "Visa"], ["hotel", "فندق", "Hotel"], ["transfer", "انتقال", "Transfer"], ["car", "سيارة", "Car"], ["train", "قطار", "Train"], ["esim", "eSIM", "eSIM"]];
const INTRO: Record<Service, [string, string]> = { visa: ["أرغب في حجز تأشيرة.", "I would like to book a visa."], hotel: ["أرغب في حجز فندق.", "I would like to book a hotel."], esim: ["أرغب في طلب شريحة eSIM.", "I would like to order an eSIM."], transfer: ["أرغب في حجز انتقال (توصيل).", "I would like to book a transfer."], car: ["أرغب في استئجار سيارة.", "I would like to rent a car."], train: ["أرغب في حجز تذاكر قطار.", "I would like to book train tickets."] };
const TimeSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => <select className="field" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)}>{TIMES.map((x) => <option key={x}>{x}</option>)}</select>;

/** Re-mounts the form when the query changes (e.g. another destination picked on the booking page). */
export default function ApplyFlow() {
  const sp = useSearchParams();
  return <Flow key={sp.toString()} sp={sp} />;
}

/** Request in three steps. Visas: trip details, travellers, review. Hotels, transfers, car rental, trains and eSIM: what is needed, contact, review. The last step saves the request and opens a ready WhatsApp message. */
function Flow({ sp }: { sp: { get(name: string): string | null } }) {
  const { countries, site, esim: simDests = [] } = useContent();
  const t = useT(), en = useLang() === "en";
  const tv = (ar: string) => (en ? VAL_EN[ar] ?? ar : ar);
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
  const steps = (en ? STEPS_EN : STEPS)[service];
  const ok0 = visa ? !!c && !!date && (!appointment || !!city.trim()) : esim ? !!sim.country.trim()
    : isRide ? !!(r.from.trim() && r.to.trim() && r.d && (!r.round || r.rd))
    : isCar ? !!(car.from.trim() && car.d && car.rd && (car.age || Number(car.years) >= 18)) : !!(h.city.trim() && h.inn && h.out);
  const ok1 = !!p.phone.trim() && (visa ? travellers.every((n) => n.trim()) : !!p.name.trim());
  const people = en ? `${adults} adult${adults > 1 ? "s" : ""}${kids ? ` + ${kids} child${kids > 1 ? "ren" : ""}` : ""}` : `${adults} بالغ${kids ? ` + ${kids} طفل` : ""}`;
  const child = t(" (طفل)", " (child)");
  const tl = (d: string) => (en ? TRIP_LENGTHS_EN[TRIP_LENGTHS.indexOf(d)] ?? d : d);

  const base: Row[] = visa
    ? [[t("الوجهة", "Destination"), c?.name ?? ""], [t("نوع التأشيرة", "Visa type"), c?.types[0] ?? t("سياحية", "Tourist")], [t("تاريخ السفر المتوقع", "Expected travel date"), date], ...(appointment ? [[t("مدينة الموعد", "Appointment city"), city] as Row] : []), [t("المسافرون", "Travellers"), people]]
    : esim
      ? [[t("وجهة السفر", "Destination"), sim.country], [t("تاريخ السفر", "Travel date"), sim.start || t("غير محدد", "Not set")], [t("مدة السفر", "Trip length"), tl(sim.days)], [t("عدد الشرائح", "Number of eSIMs"), String(sim.qty)]]
      : [[t("مكان الإقامة", "Destination"), h.city], [t("الوصول", "Check-in"), h.inn], [t("المغادرة", "Check-out"), h.out], [t("البالغون", "Adults"), String(adults)], [t("الأطفال", "Children"), String(kids)], [t("الرضّع (أقل من سنتين)", "Infants (under 2)"), String(infants)], [t("الغرف", "Rooms"), String(h.rooms)], [t("تصنيف الفندق", "Hotel rating"), tv(h.stars)]];
  const trip: Row[] = isRide
    ? [[t("نوع الرحلة", "Trip type"), r.round ? t("ذهاب وعودة", "Round trip") : t("اتجاه واحد", "One way")], [train ? t("من", "From") : t("نقطة الانطلاق", "Pick-up point"), r.from], [t("إلى", "To"), r.to], [t("الذهاب", "Outbound"), `${r.d} · ${r.t}`], ...(r.round ? [[t("العودة", "Return"), `${r.rd} · ${r.rt}`] as Row] : []), [t("الركاب", "Passengers"), String(r.pax)]]
    : isCar
      ? [[t("مكان الاستلام", "Pick-up location"), car.from], [t("مكان التسليم", "Drop-off location"), car.to.trim() || t("نفس مكان الاستلام", "Same as pick-up")], [t("الاستلام", "Pick-up"), `${car.d} · ${car.t}`], [t("التسليم", "Drop-off"), `${car.rd} · ${car.rt}`], [t("عمر السائق", "Driver age"), car.age ? t("بين 26 و69 سنة", "26 to 69 years") : t(`${car.years} سنة`, `${car.years} years`)], [t("إقامة السائق", "Driver residence"), car.res || t("غير محدد", "Not set")]]
      : base;
  const contact: Row[] = [...(visa ? [] : [[t("الاسم", "Name"), p.name] as Row]), [t("الجوال", "Mobile"), p.phone], ...(p.email.trim() ? [[t("البريد", "Email"), p.email.trim()] as Row] : []), ...(esim ? [] : [[t("الجنسية", "Nationality"), p.nationality || t("غير محدد", "Not set")] as Row, [t("الصفة", "Status"), tv(p.status)] as Row]), ...(visa ? [[t("تأشيرة سابقة", "Previous visa"), tv(p.refused)] as Row] : []), ...(p.notes.trim() ? [[t("ملاحظات", "Notes"), p.notes.trim()] as Row] : [])];
  const lines = [`${t("السلام عليكم، ", "Hello, ")}${t(...INTRO[service])}`, ...trip.map(([k, v]) => `${k}: ${v}`), ...(visa ? travellers.map((n, i) => `${i + 1}) ${n}${i >= adults ? child : ""}`) : []), ...contact.map(([k, v]) => `${k}: ${v}`)];
  const message = lines.join("\n");
  // WhatsApp opens at once (it must happen inside the click); the request is then saved for the dashboard and the visitor is told whether that worked
  const send = async () => {
    window.open(waLink(site.whatsapp, message), "_blank", "noopener");
    setBusy(true);
    const ok = await submitBooking({
      service, name: visa ? travellers[0] : p.name, phone: p.phone, email: p.email, summary: isRide ? `${train ? t("قطار", "Train") : t("انتقال", "Transfer")}: ${r.from} ${t("إلى", "to")} ${r.to}` : isCar ? `${t("سيارة", "Car")}: ${car.from}` : visa ? `${t("تأشيرة", "Visa")} ${c?.name ?? ""}` : esim ? `eSIM: ${sim.country}` : `${t("فندق", "Hotel")}: ${h.city}`,
      rows: [...trip, ...(visa ? travellers.map((n, i) => [t(`المسافر ${i + 1}`, `Traveller ${i + 1}`), `${n}${i >= adults ? child : ""}`] as Row) : []), ...contact],
    });
    setBusy(false);
    setSent(ok ? "ok" : "fail");
  };

  if (sent) {
    const ok = sent === "ok";
    return (
      <div id="form" className="card min-w-0 scroll-mt-28 p-7 text-center md:p-10">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl text-white ${ok ? "bg-sky" : "bg-amber-500"}`}>{ok ? "✓" : "!"}</span>
        <h3 className="mt-5 text-2xl font-bold">{ok ? t("تم استلام طلبك", "We received your request") : t("لم يكتمل تسجيل الطلب", "Your request was not saved")}</h3>
        <p className="mx-auto mt-3 max-w-md leading-8 text-mist/80">{ok ? t("سجّلنا طلبك وسنتواصل معك خلال 24 ساعة. إذا لم يفتح واتساب تلقائياً يمكنك فتحه من الزر.", "We have saved your request and will contact you within 24 hours. If WhatsApp did not open by itself, open it with the button.") : t("تعذّر حفظ طلبك الآن. أرسله لنا عبر واتساب من الزر ليصلنا فوراً، أو أعد المحاولة.", "We could not save your request right now. Send it to us on WhatsApp with the button so it reaches us at once, or try again.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={waLink(site.whatsapp, message)} target="_blank" rel="noopener" className="btn btn-primary">{ok ? t("فتح واتساب", "Open WhatsApp") : t("إرسال عبر واتساب", "Send on WhatsApp")}</a>
          {ok
            ? <button type="button" onClick={() => { setSent(false); setStep(0); }} className="btn btn-ghost">{t("طلب جديد", "New request")}</button>
            : <button type="button" onClick={() => setSent(false)} className="btn btn-ghost">{t("إعادة المحاولة", "Try again")}</button>}
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
          <p className="text-sm text-mist/70">{step < 2 ? t(`التالي: ${STEPS[service][step + 1]}`, `Next: ${steps[step + 1]}`) : t("آخر خطوة قبل الإرسال", "Last step before sending")}</p>
        </div>
      </div>

      {step === 0 && (
        <div>
          <div className="hs-tabs" role="tablist" aria-label={t("الخدمة", "Service")}>
            {SERVICES.map(([k, l, le]) => <button key={k} type="button" role="tab" aria-selected={service === k} onClick={() => setService(k)} className={`hs-tab ${service === k ? "is-on" : ""}`}>{t(l, le)}</button>)}
          </div>
          {visa ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{t("الوجهة", "Destination")}</span>
                  <select className="field" value={dest} onChange={(e) => setDest(e.target.value)}>
                    <option value="">{t("اختر الوجهة", "Choose destination")}</option>
                    {([["شنغن", "Schengen"], ["", "Other destinations"], ["للمقيمين", "For residents"]] as const).map(([g, e]) => (
                      <optgroup key={g || "other"} label={t(g || "وجهات أخرى", e)}>
                        {countries.filter((x) => (x.group ?? "") === g).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label className="fl"><span>{t("نوع التأشيرة", "Visa type")}</span><input className="field" readOnly value={c?.types[0] ?? t("سياحية", "Tourist")} /></label>
              </div>
              <h3 className="mt-7 text-lg font-bold">{t("ما هو التاريخ المتوقع للسفر؟", "What is your expected travel date?")}</h3>
              <p className="mt-1 text-sm leading-7 text-mist/75">{t("يمكنك تقديم الطلب الآن، ونجهّز المستندات معك قبل الموعد.", "You can submit your request now, and we will prepare the documents with you before the date.")}</p>
              <DateInput className="mt-3 sm:max-w-xs" min={today} value={date} onChange={setDate} ariaLabel={t("التاريخ المتوقع للسفر", "Expected travel date")} />
              {c && (appointment ? (
                <>
                  <h3 className="mt-7 text-lg font-bold">{t("أين تريد حجز موعدك؟", "Where do you want to book your appointment?")}</h3>
                  <p className="mt-1 text-sm leading-7 text-mist/75">{t("الحضور الشخصي مطلوب لأخذ البصمة أو المقابلة.", "Attending in person is required for fingerprints or the interview.")}</p>
                  <PlaceInput className="field mt-3 sm:max-w-sm" value={city} onChange={setCity} placeholder={t("اكتب مدينتك، مثل: الرياض، دبي، القاهرة", "Type your city, e.g. Riyadh, Dubai, Cairo")} />
                </>
              ) : <p className="bk-info mt-7">{t(`تأشيرة ${c.name} إلكترونية: لا تحتاج موعداً ولا زيارة سفارة.`, `The ${c.name} visa is electronic: no appointment or embassy visit needed.`)}</p>)}
              <h3 className="mt-7 text-lg font-bold">{t("كم عدد المسافرين؟", "How many travellers?")}</h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Counter label={t("بالغون", "Adults")} value={adults} min={1} onChange={setAdults} />
                <Counter label={t("أطفال", "Children")} value={kids} min={0} onChange={setKids} />
              </div>
            </>
          ) : isRide ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                {([[false, "اتجاه واحد", "One way"], [true, "ذهاب وعودة", "Round trip"]] as const).map(([v, l, le]) => <button key={l} type="button" onClick={() => setR({ ...r, round: v })} aria-pressed={r.round === v} className={`badge ${r.round === v ? "badge-sky bg-sky/15" : ""}`}>{t(l, le)}</button>)}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{train ? t("من", "From") : t("نقطة الانطلاق", "Pick-up point")}</span><PlaceInput className="field" airports={!train} value={r.from} onChange={(v) => setR({ ...r, from: v })} placeholder={train ? t("المدينة أو محطة القطار", "City or train station") : t("مطار أو فندق أو عنوان", "Airport, hotel or address")} /></label>
                <label className="fl"><span>{t("إلى", "To")}</span><PlaceInput className="field" airports={!train} value={r.to} onChange={(v) => setR({ ...r, to: v })} placeholder={train ? t("المدينة أو محطة القطار", "City or train station") : t("مطار أو فندق أو عنوان", "Airport, hotel or address")} /></label>
                <label className="fl"><span>{t("تاريخ الذهاب", "Outbound date")}</span><DateInput min={today} value={r.d} onChange={(v) => setR({ ...r, d: v })} ariaLabel={t("تاريخ الذهاب", "Outbound date")} /></label>
                <label className="fl"><span>{t("الوقت", "Time")}</span><TimeSelect value={r.t} onChange={(v) => setR({ ...r, t: v })} /></label>
                {r.round && <label className="fl"><span>{t("تاريخ العودة", "Return date")}</span><DateInput min={r.d || today} value={r.rd} onChange={(v) => setR({ ...r, rd: v })} ariaLabel={t("تاريخ العودة", "Return date")} /></label>}
                {r.round && <label className="fl"><span>{t("وقت العودة", "Return time")}</span><TimeSelect value={r.rt} onChange={(v) => setR({ ...r, rt: v })} /></label>}
                <div className="self-end"><Counter label={t("الركاب", "Passengers")} value={r.pax} min={1} onChange={(n) => setR({ ...r, pax: n })} /></div>
              </div>
            </>
          ) : isCar ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{t("مكان الاستلام", "Pick-up location")}</span><PlaceInput className="field" airports value={car.from} onChange={(v) => setCar({ ...car, from: v })} placeholder={t("المطار أو محطة القطار أو المدينة", "Airport, train station or city")} /></label>
                <label className="fl"><span>{t("مكان التسليم (اختياري)", "Drop-off location (optional)")}</span><PlaceInput className="field" airports value={car.to} onChange={(v) => setCar({ ...car, to: v })} placeholder={t("نفس مكان الاستلام", "Same as pick-up")} /></label>
                <label className="fl"><span>{t("تاريخ الاستلام", "Pick-up date")}</span><DateInput min={today} value={car.d} onChange={(v) => setCar({ ...car, d: v })} ariaLabel={t("تاريخ الاستلام", "Pick-up date")} /></label>
                <label className="fl"><span>{t("وقت الاستلام", "Pick-up time")}</span><TimeSelect value={car.t} onChange={(v) => setCar({ ...car, t: v })} /></label>
                <label className="fl"><span>{t("تاريخ التسليم", "Drop-off date")}</span><DateInput min={car.d || today} value={car.rd} onChange={(v) => setCar({ ...car, rd: v })} ariaLabel={t("تاريخ التسليم", "Drop-off date")} /></label>
                <label className="fl"><span>{t("وقت التسليم", "Drop-off time")}</span><TimeSelect value={car.rt} onChange={(v) => setCar({ ...car, rt: v })} /></label>
              </div>
              <label className="mt-5 flex cursor-pointer items-center gap-2.5 font-semibold"><input type="checkbox" className="h-[1.1rem] w-[1.1rem]" style={{ accentColor: "#2e94d2" }} checked={car.age} onChange={(e) => setCar({ ...car, age: e.target.checked })} />{t("عمر السائق بين 26 و69 سنة", "Driver is aged 26 to 69")}</label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {!car.age && <label className="fl"><span>{t("عمر السائق", "Driver age")}</span><input className="field" type="number" inputMode="numeric" min={18} max={99} value={car.years} onChange={(e) => setCar({ ...car, years: e.target.value })} /></label>}
                <label className="fl"><span>{t("بلد إقامة السائق", "Driver country of residence")}</span><NationalitySelect className="field" prompt={t("اختر الدولة", "Choose country")} value={car.res} onChange={(e) => setCar({ ...car, res: e.target.value })} /></label>
              </div>
            </>
          ) : esim ? (
            <>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{t("وجهة السفر", "Destination")}</span><PlaceInput className="field" value={sim.country} onChange={(v) => setSim({ ...sim, country: v })} places={esimPlaces(simDests)} placeholder={t("اكتب اسم الدولة", "Type the country name")} /></label>
                <label className="fl"><span>{t("تاريخ السفر (اختياري)", "Travel date (optional)")}</span><DateInput min={today} value={sim.start} onChange={(v) => setSim({ ...sim, start: v })} ariaLabel={t("تاريخ السفر", "Travel date")} /></label>
                <label className="fl"><span>{t("مدة السفر", "Trip length")}</span>
                  <select className="field" value={sim.days} onChange={(e) => setSim({ ...sim, days: e.target.value })}>{TRIP_LENGTHS.map((d) => <option key={d} value={d}>{tl(d)}</option>)}</select>
                </label>
                <div className="self-end"><Counter label={t("عدد الشرائح", "Number of eSIMs")} value={sim.qty} min={1} onChange={(n) => setSim({ ...sim, qty: n })} /></div>
              </div>
              <p className="bk-info mt-5">{t("شريحة eSIM تعمل على الجوالات التي تدعمها فقط. تأكد من جوالك قبل الطلب، أو اسألنا ونتحقق معك.", "An eSIM only works on phones that support it. Check your phone before ordering, or ask us and we will check with you.")}</p>
            </>
          ) : (
            <>
              <label className="fl mt-2"><span>{t("مكان الإقامة", "Destination")}</span><PlaceInput className="field" value={h.city} onChange={(v) => setH({ ...h, city: v })} placeholder={t("اكتب مدينة أو دولة أو اسم الفندق", "Type a city, country or hotel name")} /></label>
              <div className="rail mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {HOTEL_CITIES.map((a, i) => { const x = en ? HOTEL_CITIES_EN[i] : a; return <button key={a} type="button" onClick={() => setH({ ...h, city: x })} aria-pressed={h.city === x} className={`badge shrink-0 ${h.city === x ? "badge-sky bg-sky/15" : ""}`}>{x}</button>; })}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>{t("تاريخ الوصول", "Check-in date")}</span><DateInput min={today} value={h.inn} onChange={(v) => setH({ ...h, inn: v })} ariaLabel={t("تاريخ الوصول", "Check-in date")} /></label>
                <label className="fl"><span>{t("تاريخ المغادرة", "Check-out date")}</span><DateInput min={h.inn || today} value={h.out} onChange={(v) => setH({ ...h, out: v })} ariaLabel={t("تاريخ المغادرة", "Check-out date")} /></label>
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <Counter label={t("بالغون", "Adults")} value={adults} min={1} onChange={setAdults} />
                <Counter label={t("أطفال", "Children")} hint={t("2 – 11 سنة", "Ages 2 – 11")} value={kids} min={0} onChange={setKids} />
                <Counter label={t("رضّع", "Infants")} hint={t("دون سنتين", "Under 2")} value={infants} min={0} onChange={setInfants} />
                <Counter label={t("غرف", "Rooms")} value={h.rooms} min={1} onChange={(n) => setH({ ...h, rooms: n })} />
              </div>
              <label className="fl mt-5 sm:max-w-xs"><span>{t("تصنيف الفندق", "Hotel rating")}</span>
                <select className="field" value={h.stars} onChange={(e) => setH({ ...h, stars: e.target.value })}>{["لا يهم", "3 نجوم", "4 نجوم", "5 نجوم"].map((s) => <option key={s} value={s}>{tv(s)}</option>)}</select>
              </label>
            </>
          )}
          <button type="button" disabled={!ok0} onClick={() => setStep(1)} className="btn btn-primary mt-8 w-full justify-center disabled:opacity-40 sm:w-auto">{t("حفظ واستمرار", "Save and continue")}</button>
        </div>
      )}

      {step === 1 && (
        <div>
          {visa ? (
            <>
              <h3 className="text-lg font-bold">{t("أسماء المسافرين", "Traveller names")}</h3>
              <p className="mt-1 text-sm leading-7 text-mist/75">{t("اكتب الاسم كما في جواز السفر.", "Write the name as it appears in the passport.")}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {travellers.map((n, i) => (
                  <label key={i} className="fl"><span>{i === 0 ? t("المسافر الأول (مقدّم الطلب)", "First traveller (applicant)") : t(`المسافر ${i + 1}`, `Traveller ${i + 1}`) + (i >= adults ? child : "")}</span>
                    <input className="field" value={n} onChange={(e) => setNames(travellers.map((v, k) => (k === i ? e.target.value : v)))} autoComplete={i === 0 ? "name" : "off"} />
                  </label>
                ))}
              </div>
              <h3 className="mt-7 text-lg font-bold">{t("بيانات التواصل", "Contact details")}</h3>
            </>
          ) : <h3 className="text-lg font-bold">{t("بيانات التواصل", "Contact details")}</h3>}
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {!visa && <label className="fl"><span>{t("الاسم الكامل", "Full name")}</span><input className="field" value={p.name} onChange={onP("name")} autoComplete="name" /></label>}
            <label className="fl"><span>{t("رقم الجوال", "Mobile number")}</span><input className="field" type="tel" dir="ltr" value={p.phone} onChange={onP("phone")} autoComplete="tel" placeholder="05xxxxxxxx" /></label>
            <label className="fl"><span>{t("البريد الإلكتروني (اختياري)", "Email (optional)")}</span><input className="field" type="email" dir="ltr" value={p.email} onChange={onP("email")} autoComplete="email" /></label>
            {!esim && (
              <>
                <label className="fl"><span>{t("الجنسية", "Nationality")}</span><NationalitySelect className="field" value={p.nationality} onChange={onP("nationality")} /></label>
                <label className="fl"><span>{t("الصفة", "Status")}</span><select className="field" value={p.status} onChange={onP("status")}>{["مواطن", "مقيم", "زائر"].map((s) => <option key={s} value={s}>{tv(s)}</option>)}</select></label>
              </>
            )}
            {visa && (
              <label className="fl"><span>{t("هل يوجد لديك تأشيرة سابقة؟", "Do you have a previous visa?")}</span>
                <select className="field" value={p.refused} onChange={onP("refused")}><option value="لا">{t("لا", "No")}</option><option value="نعم">{t("نعم، لدي تأشيرة سابقة", "Yes, I have a previous visa")}</option></select>
              </label>
            )}
            <label className="fl sm:col-span-2"><span>{t("ملاحظات (اختياري)", "Notes (optional)")}</span><textarea className="field" rows={3} value={p.notes} onChange={onP("notes")} /></label>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="btn btn-ghost">{t("رجوع", "Back")}</button>
            <button type="button" disabled={!ok1} onClick={() => setStep(2)} className="btn btn-primary flex-1 justify-center disabled:opacity-40 sm:flex-none">{t("حفظ واستمرار", "Save and continue")}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <dl className="grid grid-cols-2 gap-3">
            {trip.map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/60">{k}</dt><dd className="mt-1 break-words font-semibold">{v || t("غير محدد", "Not set")}</dd></div>)}
          </dl>
          {visa && (
            <div className="mt-3 rounded-xl bg-white/[.04] p-3 text-sm">
              <p className="text-mist/60">{t("المسافرون", "Travellers")}</p>
              <ol className="mt-1 space-y-1 font-semibold">{travellers.map((n, i) => <li key={i}>{i + 1}) {n}{i >= adults ? child : ""}</li>)}</ol>
            </div>
          )}
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {contact.map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/60">{k}</dt><dd className="mt-1 break-words font-semibold" dir="auto">{v}</dd></div>)}
          </dl>
          {visa && <PriceNote price={c?.price} includes={site.priceIncludes} excludes={site.priceExcludes} className="mt-5" />}
          <p className="mt-5 text-sm leading-7 text-mist/75">{t("بعد الإرسال يصلنا طلبك على واتساب، ونرد خلال 24 ساعة بالمتطلبات والسعر النهائي قبل أي التزام.", "After you send, your request reaches us on WhatsApp, and we reply within 24 hours with the requirements and the final price, before any commitment.")}</p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">{t("تعديل", "Edit")}</button>
            <button type="button" onClick={send} disabled={busy} className="btn btn-primary flex-1 justify-center disabled:opacity-60 sm:flex-none">{busy ? t("جارٍ الإرسال…", "Sending…") : t("تأكيد وإرسال الطلب", "Confirm and send request")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
