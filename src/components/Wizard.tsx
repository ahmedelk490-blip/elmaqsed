"use client";
import { useState } from "react";
import { useContent } from "./ContentProvider";
import { waLink } from "@/lib/types";

const purposes = ["سياحة", "أعمال", "دراسة", "علاج", "زيارة عائلية"];
const titles = ["اختر وجهتك", "بياناتك", "مراجعة وإرسال"];

/** Three-step consultation wizard that ends in a pre-filled WhatsApp message. */
export default function Wizard() {
  const { countries, site } = useContent();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ dest: "", name: "", phone: "", nationality: "", purpose: "سياحة", date: "", refused: "لا" });
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const pick = (dest: string) => { setF({ ...f, dest }); setStep(1); };
  const send = () => {
    const msg = `السلام عليكم، أرغب في استشارة تأشيرة.\nالوجهة: ${f.dest}\nالاسم: ${f.name}\nالجوال: ${f.phone}\nالجنسية: ${f.nationality}\nالغرض: ${f.purpose}\nتاريخ السفر المتوقع: ${f.date || "غير محدد"}\nرفض سابق: ${f.refused}`;
    window.open(waLink(site.whatsapp, msg), "_blank", "noopener");
  };
  const review: [string, string][] = [["الوجهة", f.dest], ["الاسم", f.name], ["الجوال", f.phone], ["الجنسية", f.nationality], ["الغرض", f.purpose], ["تاريخ السفر", f.date || "غير محدد"], ["رفض سابق", f.refused]];

  return (
    <div className="card p-6 md:p-9">
      <div className="mb-8 flex items-center gap-2">
        {titles.map((t, i) => (
          <div key={t} className="flex flex-1 items-center gap-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors duration-500 ${i <= step ? "border-sky bg-sky text-white" : "border-white/20 text-mist/50"}`}>{i + 1}</span>
            <span className={`hidden text-sm sm:block ${i === step ? "text-white" : "text-mist/50"}`}>{t}</span>
            {i < 2 && <span className="h-px flex-1 bg-white/10"><span className="block h-full origin-right bg-sky transition-transform duration-500" style={{ transform: `scaleX(${i < step ? 1 : 0})` }} /></span>}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {countries.map((c) => (
            <button key={c.slug} onClick={() => pick(c.name)} className={`flex items-center gap-3 rounded-2xl border p-3 text-start transition-colors hover:border-sky ${f.dest === c.name ? "border-sky bg-sky/10" : "border-white/10"}`}>
              <span className={`fi fi-${c.code} rounded-sm`} /><span className="text-sm font-semibold">{c.name}</span>
            </button>
          ))}
          <button onClick={() => pick("وجهة أخرى")} className="rounded-2xl border border-dashed border-white/20 p-3 text-sm text-mist/70 transition-colors hover:border-sky">وجهة أخرى</button>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field" placeholder="الاسم الكامل" value={f.name} onChange={on("name")} />
          <input className="field" placeholder="رقم الجوال" type="tel" dir="ltr" value={f.phone} onChange={on("phone")} />
          <input className="field" placeholder="الجنسية" value={f.nationality} onChange={on("nationality")} />
          <select className="field" value={f.purpose} onChange={on("purpose")} aria-label="غرض السفر">{purposes.map((p) => <option key={p}>{p}</option>)}</select>
          <input className="field" type="month" value={f.date} onChange={on("date")} aria-label="تاريخ السفر المتوقع" />
          <select className="field" value={f.refused} onChange={on("refused")} aria-label="رفض سابق">
            <option value="لا">لم يسبق رفض تأشيرتي</option>
            <option value="نعم">سبق أن رُفضت تأشيرتي</option>
          </select>
          <div className="flex gap-3 sm:col-span-2">
            <button onClick={() => setStep(0)} className="btn btn-ghost">رجوع</button>
            <button disabled={!f.name || !f.phone} onClick={() => setStep(2)} className="btn btn-primary disabled:opacity-40">التالي</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {review.map(([k, v]) => <div key={k} className="rounded-xl bg-white/[.04] p-3 text-sm"><dt className="text-mist/50">{k}</dt><dd className="mt-1 font-semibold">{v || "—"}</dd></div>)}
          </dl>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(1)} className="btn btn-ghost">تعديل</button>
            <button onClick={send} className="btn btn-primary">أرسل عبر واتساب</button>
          </div>
        </div>
      )}
    </div>
  );
}
