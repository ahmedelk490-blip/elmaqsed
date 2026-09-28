"use client";
import { useState } from "react";
import { waLink } from "@/lib/types";
import { useContent } from "./ContentProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const init = { name: "", phone: "", nationality: "", dest: "", purpose: "سياحة", date: "", refused: "لا" };

export default function Contact() {
  const { countries, site } = useContent();
  const [f, setF] = useState(init);
  const on = (k: keyof typeof init) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `السلام عليكم، أرغب في استشارة تأشيرة.\nالاسم: ${f.name}\nالجوال: ${f.phone}\nالجنسية: ${f.nationality}\nالوجهة: ${f.dest}\nالغرض: ${f.purpose}\nتاريخ السفر المتوقع: ${f.date || "غير محدد"}\nرفض سابق: ${f.refused}`;
    window.open(waLink(site.whatsapp, msg), "_blank", "noopener");
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50vh] bg-[radial-gradient(ellipse_at_bottom,rgba(46,148,210,.22),transparent_60%)]" />
      {[8, 22, 37, 51, 64, 78, 90].map((l, i) => <span key={l} className="meteor" style={{ left: `${l}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${5 + (i % 3)}s` }} aria-hidden="true" />)}
      <Reveal className="container-x relative grid gap-12 lg:grid-cols-[1fr_.8fr]">
        <form onSubmit={submit} className="card beam p-7 md:p-9">
          <h2 data-r className="text-2xl font-bold md:text-3xl">اطلب استشارتك المجانية</h2>
          <p data-r className="mt-2 text-mist/70">املأ البيانات وسنكمل معك على واتساب خلال 24 ساعة.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <input data-r className="field" placeholder="الاسم الكامل" required value={f.name} onChange={on("name")} />
            <input data-r className="field" placeholder="رقم الجوال" type="tel" required value={f.phone} onChange={on("phone")} dir="ltr" />
            <input data-r className="field" placeholder="الجنسية" required value={f.nationality} onChange={on("nationality")} />
            <select data-r className="field" required value={f.dest} onChange={on("dest")} aria-label="الوجهة المطلوبة">
              <option value="">الوجهة المطلوبة</option>
              {countries.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
              <option value="أخرى">وجهة أخرى</option>
            </select>
            <select data-r className="field" value={f.purpose} onChange={on("purpose")} aria-label="غرض السفر">
              {["سياحة", "أعمال", "دراسة", "علاج", "زيارة عائلية"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input data-r className="field" type="month" value={f.date} onChange={on("date")} aria-label="تاريخ السفر المتوقع" />
            <select data-r className="field sm:col-span-2" value={f.refused} onChange={on("refused")} aria-label="هل سبق رفض تأشيرتك؟">
              <option value="لا">لم يسبق رفض تأشيرتي</option>
              <option value="نعم">سبق أن رُفضت تأشيرتي</option>
            </select>
          </div>
          <button type="submit" data-r className="btn btn-primary mt-6 w-full justify-center sm:w-auto">أرسل عبر واتساب</button>
        </form>

        <div className="flex flex-col justify-center">
          <SectionHead eyebrow="Contact" title="تواصل معنا" text="استشارة أولى مجانية بلا أي التزام. نرد على واتساب والهاتف طوال أيام الأسبوع." />
          <ul className="space-y-4 text-lg">
            <li data-r className="card flex items-center justify-between rounded-2xl p-5"><span className="text-mist/60">واتساب</span><a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="font-semibold hover:text-sky-2" dir="ltr">+{site.whatsapp}</a></li>
            <li data-r className="card flex items-center justify-between rounded-2xl p-5"><span className="text-mist/60">الهاتف</span><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-semibold hover:text-sky-2" dir="ltr">{site.phone}</a></li>
            <li data-r className="card flex items-center justify-between rounded-2xl p-5"><span className="text-mist/60">البريد</span><a href={`mailto:${site.email}`} className="font-semibold hover:text-sky-2">{site.email}</a></li>
            <li data-r className="card flex items-center justify-between rounded-2xl p-5"><span className="text-mist/60">المقر</span><span className="font-semibold">{site.city}</span></li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
