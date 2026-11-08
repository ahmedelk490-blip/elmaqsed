"use client";
import { useState } from "react";
import { waLink, contactLines } from "@/lib/types";
import { submitBooking } from "@/lib/submit";
import NationalitySelect from "./NationalitySelect";
import DateInput from "./DateInput";
import { useContent, useT } from "./ContentProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const PURPOSES: [string, string][] = [["سياحة", "Tourism"], ["أعمال", "Business"], ["دراسة", "Study"], ["علاج", "Medical"], ["زيارة عائلية", "Family visit"]];
const init = { name: "", phone: "", nationality: "", dest: "", purpose: "سياحة", date: "", refused: "لا" };

export default function Contact() {
  const { countries, site } = useContent();
  const t = useT();
  const { calls, chats } = contactLines(site);
  const [f, setF] = useState(init);
  const on = (k: keyof typeof init) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const purpose = PURPOSES.find(([a]) => a === f.purpose)?.[1] ?? f.purpose;
    const msg = t(
      `السلام عليكم، أرغب في استشارة تأشيرة.\nالاسم: ${f.name}\nالجوال: ${f.phone}\nالجنسية: ${f.nationality}\nالوجهة: ${f.dest}\nالغرض: ${f.purpose}\nتاريخ السفر المتوقع: ${f.date || "غير محدد"}\nتأشيرة سابقة: ${f.refused}`,
      `Hello, I would like a visa consultation.\nName: ${f.name}\nMobile: ${f.phone}\nNationality: ${f.nationality}\nDestination: ${f.dest}\nPurpose: ${purpose}\nExpected travel date: ${f.date || "Not set"}\nPrevious visa: ${f.refused === "نعم" ? "Yes" : "No"}`,
    );
    window.open(waLink(site.whatsapp, msg), "_blank", "noopener");
    void submitBooking({ service: "contact", name: f.name, phone: f.phone, email: "", summary: `استشارة: ${f.dest || "غير محدد"}`, rows: [["الاسم", f.name], ["الجوال", f.phone], ["الجنسية", f.nationality], ["الوجهة", f.dest], ["الغرض", f.purpose], ["تاريخ السفر", f.date || "غير محدد"], ["تأشيرة سابقة", f.refused]] });
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50vh] bg-[radial-gradient(ellipse_at_bottom,rgba(46,148,210,.22),transparent_60%)]" />
      {[8, 22, 37, 51, 64, 78, 90].map((l, i) => <span key={l} className="meteor" style={{ left: `${l}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${5 + (i % 3)}s` }} aria-hidden="true" />)}
      <Reveal className="container-x relative grid gap-12 lg:grid-cols-[1fr_.8fr]">
        <form onSubmit={submit} className="card beam p-7 md:p-9">
          <h2 data-r className="text-2xl font-bold md:text-3xl">{t("اطلب استشارتك المجانية", "Request your free consultation")}</h2>
          <p data-r className="mt-2 text-mist/70">{t("املأ البيانات وسنكمل معك على واتساب خلال 24 ساعة.", "Fill in your details and we will continue on WhatsApp within 24 hours.")}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <input data-r className="field" placeholder={t("الاسم الكامل", "Full name")} required value={f.name} onChange={on("name")} />
            <input data-r className="field" placeholder={t("رقم الجوال", "Mobile number")} type="tel" required value={f.phone} onChange={on("phone")} dir="ltr" />
            <NationalitySelect data-r className="field" prompt={t("الجنسية", "Nationality")} required value={f.nationality} onChange={on("nationality")} />
            <select data-r className="field" required value={f.dest} onChange={on("dest")} aria-label={t("الوجهة المطلوبة", "Destination")}>
              <option value="">{t("الوجهة المطلوبة", "Destination")}</option>
              {countries.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
              <option value="أخرى">{t("وجهة أخرى", "Other destination")}</option>
            </select>
            <select data-r className="field" value={f.purpose} onChange={on("purpose")} aria-label={t("غرض السفر", "Purpose of travel")}>
              {PURPOSES.map(([ar, en]) => <option key={ar} value={ar}>{t(ar, en)}</option>)}
            </select>
            <DateInput reveal type="month" value={f.date} onChange={(v) => setF({ ...f, date: v })} ariaLabel={t("تاريخ السفر المتوقع", "Expected travel date")} />
            <select data-r className="field sm:col-span-2" value={f.refused} onChange={on("refused")} aria-label={t("هل يوجد لديك تأشيرة سابقة؟", "Do you have a previous visa?")}>
              <option value="لا">{t("لا توجد لدي تأشيرة سابقة", "I have no previous visa")}</option>
              <option value="نعم">{t("لدي تأشيرة سابقة", "I have a previous visa")}</option>
            </select>
          </div>
          <button type="submit" data-r className="btn btn-primary mt-6 w-full justify-center sm:w-auto">{t("أرسل عبر واتساب", "Send via WhatsApp")}</button>
        </form>

        <div className="flex min-w-0 flex-col justify-center">
          <SectionHead eyebrow="Contact" title={t("تواصل معنا", "Contact us")} text={t("استشارة أولى مجانية بلا أي التزام. نرد على واتساب والهاتف طوال أيام الأسبوع.", "A free first consultation with no commitment. We reply on WhatsApp and by phone every day of the week.")} />
          <ul className="space-y-4 text-lg">
            {chats.map((l) => (
              <li key={`w${l.dial}`} data-r className="card flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl p-5"><span className="text-mist/60">{t("واتساب", "WhatsApp")} <span className="text-sm text-mist/45">· {t(l.ar, l.en)}</span></span><a href={waLink(l.dial)} target="_blank" rel="noopener" className="flex items-center gap-2 font-semibold hover:text-sky-2" dir="ltr">{l.flag && <span className={`fi fi-${l.flag} rounded-sm`} />}{l.shown}</a></li>
            ))}
            {calls.map((l) => (
              <li key={`c${l.dial}`} data-r className="card flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl p-5"><span className="text-mist/60">{t("الهاتف", "Phone")} <span className="text-sm text-mist/45">· {t(l.ar, l.en)}</span></span><a href={`tel:+${l.dial}`} className="flex items-center gap-2 font-semibold hover:text-sky-2" dir="ltr">{l.flag && <span className={`fi fi-${l.flag} rounded-sm`} />}{l.shown}</a></li>
            ))}
            <li data-r className="card flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl p-5"><span className="text-mist/60">{t("البريد", "Email")}</span><a href={`mailto:${site.email}`} className="font-semibold hover:text-sky-2">{site.email}</a></li>
            <li data-r className="card flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-2xl p-5"><span className="text-mist/60">{t("المقر", "Office")}</span><span className="font-semibold">{site.city}</span></li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
