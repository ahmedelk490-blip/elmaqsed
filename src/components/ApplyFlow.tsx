"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import { submitBooking } from "@/lib/submit";
import PriceNote from "./PriceNote";

const CITIES = ["الرياض", "جدة", "الدمام"];
const HOTEL_CITIES = ["الرياض", "جدة", "مكة المكرمة", "دبي", "باريس", "لندن", "إسطنبول", "القاهرة"];
const STEPS = { visa: ["تفاصيل الرحلة", "تفاصيل المسافرين", "المراجعة والإرسال"], hotel: ["تفاصيل الإقامة", "بياناتك", "المراجعة والإرسال"] };
type Row = [string, string];

/** Re-mounts the form when the query changes (e.g. another destination picked on the booking page). */
export default function ApplyFlow() {
  const sp = useSearchParams();
  return <Flow key={sp.toString()} sp={sp} />;
}

function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`تقليل ${label}`} className="cnt-btn">−</button>
        <b className="w-5 text-center">{value}</b>
        <button type="button" onClick={() => onChange(Math.min(9, value + 1))} aria-label={`زيادة ${label}`} className="cnt-btn">+</button>
      </span>
    </div>
  );
}

/** Booking in three steps. Visas: trip details, travellers, review. Hotels: stay details, contact, review. The last step sends a ready WhatsApp message. */
function Flow({ sp }: { sp: { get(name: string): string | null } }) {
  const { countries, site } = useContent();
  const first = countries.find((c) => c.slug === sp.get("dest"));
  const [service, setService] = useState<"visa" | "hotel">(sp.get("service") === "hotel" ? "hotel" : "visa");
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState<false | "ok" | "fail">(false);
  const [busy, setBusy] = useState(false);
  const [dest, setDest] = useState(first?.slug ?? "");
  const [date, setDate] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [adults, setAdults] = useState(service === "hotel" ? parseInt(sp.get("guests") ?? "2") || 2 : 1);
  const [kids, setKids] = useState(0);
  const [names, setNames] = useState<string[]>([]);
  const [h, setH] = useState({ city: sp.get("city") ?? "", inn: sp.get("in") ?? "", out: sp.get("out") ?? "", rooms: 1, stars: "لا يهم" });
  const [p, setP] = useState({ name: "", phone: "", email: "", nationality: "", status: first?.group === "للمقيمين" ? "مقيم في السعودية" : "مواطن سعودي", refused: "لا", notes: "" });
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const onP = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP((x) => ({ ...x, [k]: e.target.value }));

  const c = countries.find((x) => x.slug === dest);
  const visa = service === "visa";
  const appointment = !!c && !c.kind.includes("إلكترون");
  const total = adults + kids;
  const travellers = Array.from({ length: total }, (_, i) => names[i] ?? "");
  const steps = STEPS[service];
  const ok0 = visa ? !!c && !!date : !!(h.city.trim() && h.inn && h.out);
  const ok1 = !!p.phone.trim() && (visa ? travellers.every((n) => n.trim()) : !!p.name.trim());
  const people = `${adults} بالغ${kids ? ` + ${kids} طفل` : ""}`;

  const trip: Row[] = visa
    ? [["الوجهة", c?.name ?? ""], ["نوع التأشيرة", c?.types[0] ?? "سياحية"], ["تاريخ السفر المتوقع", date], ...(appointment ? [["مدينة الموعد", city] as Row] : []), ["المسافرون", people]]
    : [["مكان الإقامة", h.city], ["الوصول", h.inn], ["المغادرة", h.out], ["النزلاء", people], ["الغرف", String(h.rooms)], ["تصنيف الفندق", h.stars]];
  const contact: Row[] = [...(visa ? [] : [["الاسم", p.name] as Row]), ["الجوال", p.phone], ...(p.email.trim() ? [["البريد", p.email.trim()] as Row] : []), ["الجنسية", p.nationality || "غير محدد"], ["الصفة", p.status], ...(visa ? [["رفض سابق", p.refused] as Row] : []), ...(p.notes.trim() ? [["ملاحظات", p.notes.trim()] as Row] : [])];
  const lines = [visa ? "السلام عليكم، أرغب في حجز تأشيرة." : "السلام عليكم، أرغب في حجز فندق.", ...trip.map(([k, v]) => `${k}: ${v}`), ...(visa ? travellers.map((n, i) => `${i + 1}) ${n}${i >= adults ? " (طفل)" : ""}`) : []), ...contact.map(([k, v]) => `${k}: ${v}`)];
  const message = lines.join("\n");
  // WhatsApp opens at once (it must happen inside the click); the request is then saved for the dashboard and the visitor is told whether that worked
  const send = async () => {
    window.open(waLink(site.whatsapp, message), "_blank", "noopener");
    setBusy(true);
    const ok = await submitBooking({
      service, name: visa ? travellers[0] : p.name, phone: p.phone, email: p.email, summary: visa ? `تأشيرة ${c?.name ?? ""}` : `فندق: ${h.city}`,
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
            <button type="button" role="tab" aria-selected={visa} onClick={() => setService("visa")} className={`hs-tab ${visa ? "is-on" : ""}`}>تأشيرة</button>
            <button type="button" role="tab" aria-selected={!visa} onClick={() => setService("hotel")} className={`hs-tab ${!visa ? "is-on" : ""}`}>فندق</button>
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
              <input className="field mt-3 sm:max-w-xs" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} aria-label="التاريخ المتوقع للسفر" />
              {c && (appointment ? (
                <>
                  <h3 className="mt-7 text-lg font-bold">أين تريد حجز موعدك؟</h3>
                  <p className="mt-1 text-sm leading-7 text-mist/75">الحضور الشخصي مطلوب لأخذ البصمة أو المقابلة.</p>
                  <div className="mt-3 grid grid-cols-3 gap-2.5">
                    {CITIES.map((x) => <button key={x} type="button" aria-pressed={city === x} onClick={() => setCity(x)} className={`bk-opt ${city === x ? "is-on" : ""}`}>{x}</button>)}
                  </div>
                </>
              ) : <p className="bk-info mt-7">تأشيرة {c.name} إلكترونية: لا تحتاج موعداً ولا زيارة سفارة.</p>)}
              <h3 className="mt-7 text-lg font-bold">كم عدد المسافرين؟</h3>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Counter label="بالغون" value={adults} min={1} onChange={setAdults} />
                <Counter label="أطفال" value={kids} min={0} onChange={setKids} />
              </div>
            </>
          ) : (
            <>
              <label className="fl mt-2"><span>مكان الإقامة</span><input className="field" value={h.city} onChange={(e) => setH({ ...h, city: e.target.value })} placeholder="المدينة أو اسم الفندق" /></label>
              <div className="rail mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {HOTEL_CITIES.map((x) => <button key={x} type="button" onClick={() => setH({ ...h, city: x })} aria-pressed={h.city === x} className={`badge shrink-0 ${h.city === x ? "badge-sky bg-sky/15" : ""}`}>{x}</button>)}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="fl"><span>تاريخ الوصول</span><input className="field" type="date" min={today} value={h.inn} onChange={(e) => setH({ ...h, inn: e.target.value })} /></label>
                <label className="fl"><span>تاريخ المغادرة</span><input className="field" type="date" min={h.inn || today} value={h.out} onChange={(e) => setH({ ...h, out: e.target.value })} /></label>
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                <Counter label="بالغون" value={adults} min={1} onChange={setAdults} />
                <Counter label="أطفال" value={kids} min={0} onChange={setKids} />
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
            <label className="fl"><span>الجنسية</span><input className="field" value={p.nationality} onChange={onP("nationality")} /></label>
            <label className="fl"><span>الصفة</span><select className="field" value={p.status} onChange={onP("status")}>{["مواطن سعودي", "مقيم في السعودية", "زائر"].map((s) => <option key={s}>{s}</option>)}</select></label>
            {visa && (
              <label className="fl"><span>هل سبق رفض تأشيرتك؟</span>
                <select className="field" value={p.refused} onChange={onP("refused")}><option value="لا">لا، لم يسبق</option><option value="نعم">نعم، سبق رفضها</option></select>
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
