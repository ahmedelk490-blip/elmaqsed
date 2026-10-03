"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";
import PriceNote from "./PriceNote";

const STEPS = ["تفاصيل الطلب", "بياناتك", "مراجعة وإرسال"];
const COUNT = ["1", "2", "3", "4", "5", "6+"];
type Row = [string, string];

/** Three short steps for a visa application or a hotel request; the last step sends everything as a ready WhatsApp message. */
export default function ApplyFlow() {
  const { countries, site } = useContent();
  const sp = useSearchParams();
  const first = countries.find((c) => c.slug === sp.get("dest"));
  const [service, setService] = useState<"visa" | "hotel">(sp.get("service") === "hotel" ? "hotel" : "visa");
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    dest: first?.slug ?? "", type: sp.get("type") ?? first?.types[0] ?? "", month: "", travelers: "1",
    city: sp.get("city") ?? "", inn: sp.get("in") ?? "", out: sp.get("out") ?? "", guests: sp.get("guests") ?? "2", rooms: "1",
    name: "", phone: "", nationality: "", status: "مواطن سعودي", refused: "لا", notes: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const pickDest = (e: React.ChangeEvent<HTMLSelectElement>) => setF((p) => ({ ...p, dest: e.target.value, type: countries.find((x) => x.slug === e.target.value)?.types[0] ?? "" }));
  const c = countries.find((x) => x.slug === f.dest);
  const ok0 = service === "visa" ? !!c : !!(f.city.trim() && f.inn && f.out);
  const ok1 = !!(f.name.trim() && f.phone.trim());
  const order: Row[] = service === "visa"
    ? [["الخدمة", "تأشيرة"], ["الوجهة", c?.name ?? ""], ["نوع التأشيرة", f.type], ["موعد السفر المتوقع", f.month || "غير محدد"], ["عدد المسافرين", f.travelers]]
    : [["الخدمة", "حجز فندق"], ["المدينة", f.city], ["الوصول", f.inn], ["المغادرة", f.out], ["النزلاء", f.guests], ["الغرف", f.rooms]];
  const person: Row[] = [["الاسم", f.name], ["الجوال", f.phone], ["الجنسية", f.nationality || "غير محدد"], ["الصفة", f.status]];
  if (service === "visa") person.push(["رفض سابق", f.refused]);
  if (f.notes.trim()) person.push(["ملاحظات", f.notes.trim()]);
  const send = () => {
    const head = service === "visa" ? "السلام عليكم، أرغب في التقديم على تأشيرة." : "السلام عليكم، أرغب في حجز فندق.";
    window.open(waLink(site.whatsapp, [head, ...[...order.slice(1), ...person].map(([k, v]) => `${k}: ${v}`)].join("\n")), "_blank", "noopener");
  };

  return (
    <div className="card p-5 md:p-9">
      <ol className="mb-7 flex items-center gap-2">
        {STEPS.map((t, i) => (
          <li key={t} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors duration-500 ${i <= step ? "border-sky bg-sky text-white" : "border-white/20 text-mist/50"}`}>{i + 1}</span>
            <span className={`hidden text-sm sm:block ${i === step ? "text-white" : "text-mist/50"}`}>{t}</span>
            {i < 2 && <span className="h-px flex-1 bg-white/10" />}
          </li>
        ))}
      </ol>
      <p className="mb-5 text-lg font-bold sm:hidden">{STEPS[step]}</p>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="hs-tabs w-max sm:col-span-2" role="tablist" aria-label="الخدمة">
            <button type="button" role="tab" aria-selected={service === "visa"} onClick={() => setService("visa")} className={`hs-tab ${service === "visa" ? "is-on" : ""}`}>تأشيرة</button>
            <button type="button" role="tab" aria-selected={service === "hotel"} onClick={() => setService("hotel")} className={`hs-tab ${service === "hotel" ? "is-on" : ""}`}>فندق</button>
          </div>
          {service === "visa" ? (
            <>
              <label className="fl sm:col-span-2"><span>الوجهة</span>
                <select className="field" value={f.dest} onChange={pickDest}>
                  <option value="">اختر الوجهة</option>
                  {["شنغن", "", "للمقيمين"].map((g) => (
                    <optgroup key={g || "other"} label={g || "وجهات أخرى"}>
                      {countries.filter((x) => (x.group ?? "") === g).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="fl"><span>نوع التأشيرة</span>
                <select className="field" value={f.type} onChange={set("type")} disabled={!c}>{(c?.types ?? ["اختر الوجهة أولاً"]).map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="fl"><span>عدد المسافرين</span>
                <select className="field" value={f.travelers} onChange={set("travelers")}>{COUNT.map((n) => <option key={n}>{n}</option>)}</select>
              </label>
              <label className="fl sm:col-span-2"><span>موعد السفر المتوقع (اختياري)</span><input className="field" type="month" value={f.month} onChange={set("month")} /></label>
            </>
          ) : (
            <>
              <label className="fl sm:col-span-2"><span>المدينة أو الوجهة</span><input className="field" value={f.city} onChange={set("city")} placeholder="مثال: باريس" /></label>
              <label className="fl"><span>تاريخ الوصول</span><input className="field" type="date" value={f.inn} onChange={set("inn")} /></label>
              <label className="fl"><span>تاريخ المغادرة</span><input className="field" type="date" min={f.inn} value={f.out} onChange={set("out")} /></label>
              <label className="fl"><span>عدد النزلاء</span><select className="field" value={f.guests} onChange={set("guests")}>{COUNT.map((n) => <option key={n}>{n}</option>)}</select></label>
              <label className="fl"><span>عدد الغرف</span><select className="field" value={f.rooms} onChange={set("rooms")}>{["1", "2", "3", "4+"].map((n) => <option key={n}>{n}</option>)}</select></label>
            </>
          )}
          <div className="sm:col-span-2"><button type="button" disabled={!ok0} onClick={() => setStep(1)} className="btn btn-primary w-full justify-center disabled:opacity-40 sm:w-auto">التالي</button></div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="fl"><span>الاسم الكامل</span><input className="field" value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <label className="fl"><span>رقم الجوال</span><input className="field" type="tel" dir="ltr" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="05xxxxxxxx" /></label>
          <label className="fl"><span>الجنسية</span><input className="field" value={f.nationality} onChange={set("nationality")} /></label>
          <label className="fl"><span>الصفة</span><select className="field" value={f.status} onChange={set("status")}>{["مواطن سعودي", "مقيم في السعودية", "زائر"].map((s) => <option key={s}>{s}</option>)}</select></label>
          {service === "visa" && (
            <label className="fl sm:col-span-2"><span>هل سبق رفض تأشيرتك؟</span>
              <select className="field" value={f.refused} onChange={set("refused")}><option value="لا">لا، لم يسبق</option><option value="نعم">نعم، سبق رفضها</option></select>
            </label>
          )}
          <label className="fl sm:col-span-2"><span>ملاحظات (اختياري)</span><textarea className="field" rows={3} value={f.notes} onChange={set("notes")} /></label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="button" onClick={() => setStep(0)} className="btn btn-ghost">رجوع</button>
            <button type="button" disabled={!ok1} onClick={() => setStep(2)} className="btn btn-primary flex-1 justify-center disabled:opacity-40 sm:flex-none">التالي</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <dl className="grid grid-cols-2 gap-3">
            {[...order, ...person].map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/55">{k}</dt><dd className="mt-1 break-words font-semibold">{v || "غير محدد"}</dd></div>)}
          </dl>
          {service === "visa" && <PriceNote price={c?.price} includes={site.priceIncludes} excludes={site.priceExcludes} className="mt-5" />}
          <p className="mt-5 text-sm leading-7 text-mist/70">بعد الإرسال يصلنا طلبك على واتساب، ونرد خلال 24 ساعة بالمتطلبات والسعر النهائي قبل أي التزام.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">تعديل</button>
            <button type="button" onClick={send} className="btn btn-primary flex-1 justify-center sm:flex-none">أرسل الطلب عبر واتساب</button>
          </div>
        </div>
      )}
    </div>
  );
}
