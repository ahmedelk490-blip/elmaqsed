import type { Country } from "@/lib/types";
import type { DestTheme } from "@/lib/destinations";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { getT } from "@/lib/i18n";

/** Five quick facts about the destination, each card topped with the flag accent. */
export async function Glance({ c, t }: { c: Country; t: DestTheme }) {
  const tr = await getT();
  const items: [string, string][] = [[t.capLabel ?? tr("العاصمة", "Capital"), t.capital], [tr("العملة", "Currency"), t.currency], [tr("اللغة", "Language"), t.language]];
  return (
    <section className="relative py-14 md:py-20">
      <div className="container-x">
        <Reveal><SectionHead eyebrow="At a glance" title={tr(`${c.name} في سطور`, `${c.name} at a glance`)} /></Reveal>
        <Reveal className="-mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
          {items.map(([k, v], i) => (
            <div key={k} data-r className={`card p-5 ${i === 2 ? "col-span-2 md:col-span-1" : ""}`}>
              <span className="mb-3 block h-1 w-8 rounded-full bg-[var(--accent)]" />
              <p className="text-xs text-mist/55">{k}</p>
              <p className="mt-1.5 font-bold leading-7">{v}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-4 text-xs text-mist/45">{tr("معلومات عامة للاستئناس.", "General information, for guidance only.")}</p>
      </div>
    </section>
  );
}

const EV_EN: [string, string][] = [["Fill in the application", "We complete the online form accurately on your behalf."], ["Upload documents", "We prepare photos and documents in the required sizes and upload them."], ["Pay the fees", "You pay the official fees directly through the approved portal."], ["Receive the visa", "The visa reaches your email and we review it with you before you travel."]];
const EV: [string, string][] = [["تعبئة الطلب", "نعبّئ النموذج الإلكتروني بدقة نيابةً عنك."], ["رفع المستندات", "نجهّز الصور والمستندات بالمقاسات المطلوبة ونرفعها."], ["سداد الرسوم", "تدفع الرسوم الرسمية مباشرة عبر البوابة المعتمدة."], ["استلام التأشيرة", "تصلك التأشيرة على بريدك ونراجعها معك قبل السفر."]];

/** Online-visa destinations: a phone that cycles through the four screens of the application. */
export async function EVisaFlow({ c }: { c: Country }) {
  const tr = await getT();
  const ev = EV.map(([h, p], i) => [tr(h, EV_EN[i][0]), tr(p, EV_EN[i][1])]);
  return (
    <section className="relative overflow-hidden bg-ink/60 py-20 md:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <Reveal><SectionHead eyebrow="Online visa" title={tr(`تأشيرة ${c.name} من شاشتك`, `${c.name} visa from your screen`)} text={tr("لا طوابير ولا زيارة سفارة. نتولى الطلب الإلكتروني كاملاً ونتابعه حتى تصلك التأشيرة.", "No queues and no embassy visit. We handle the whole online application and follow it until your visa arrives.")} /></Reveal>
          <Reveal className="grid gap-3 sm:grid-cols-2">
            {ev.map(([h, p], i) => (
              <div key={h} data-r className="card p-5">
                <span className="font-serif text-2xl text-[var(--accent)]">0{i + 1}</span>
                <h3 className="mt-2 font-bold">{h}</h3>
                <p className="mt-1 text-sm leading-7 text-mist/70">{p}</p>
              </div>
            ))}
          </Reveal>
        </div>
        <div className="phone mx-auto" aria-hidden="true">
          <span className="phone-notch" />
          {ev.map(([h], i) => (
            <div key={h} className={`phone-screen ${i === 0 ? "is-first" : ""}`} style={{ animationDelay: `${[0, -9, -6, -3][i]}s` }}>
              <p className="text-xs text-mist/55">{tr(`الخطوة ${i + 1} من 4`, `Step ${i + 1} of 4`)}</p>
              <p className="mt-1 text-lg font-bold">{h}</p>
              {i === 0 && <div className="mt-6 space-y-3">{[tr("الاسم كما في الجواز", "Name as in passport"), tr("رقم الجواز", "Passport number"), tr("تاريخ السفر", "Travel date"), tr("مدة الإقامة", "Length of stay")].map((l) => <div key={l}><p className="mb-1 text-xs text-mist/50">{l}</p><div className="h-8 rounded-lg border border-white/10 bg-white/[.05]" /></div>)}</div>}
              {i === 1 && <div className="mt-6 grid grid-cols-2 gap-3">{[tr("الجواز", "Passport"), tr("الصورة", "Photo"), tr("الحجز", "Booking"), tr("كشف الحساب", "Bank statement")].map((l) => <div key={l} className="grid h-24 place-items-center rounded-xl border border-dashed border-white/20 text-center text-xs text-mist/60">{l}<span className="block text-[var(--accent)]">✓</span></div>)}</div>}
              {i === 2 && <div className="mt-8"><div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs text-mist/55">{tr("الرسوم الرسمية", "Official fees")}</p><p dir="ltr" className="mt-1 text-right font-serif text-2xl">e-Visa · {c.en}</p></div><div className="mt-5 h-11 rounded-full bg-[var(--accent)]" /></div>}
              {i === 3 && <div className="mt-10 grid place-items-center text-center"><span className="grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--accent)] text-4xl text-[var(--accent)]">✓</span><p className="mt-5 font-bold">{tr("تمت الموافقة", "Approved")}</p><p className="mt-1 text-xs text-mist/55">{tr("وصلت التأشيرة إلى بريدك", "The visa has reached your email")}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const EMB_EN: [string, string][] = [["Book the appointment", "We book the earliest available embassy slot and remind you before it."], ["Final review", "We go through your file with you, page by page, before the appointment."], ["Attend and submit", "You hand in the application and answer the officer's questions if any, and we prepare you for them in advance."], ["Processing period", "We follow your application status and keep you updated at every step."], ["Collect your passport", "You collect your passport with the visa, ready for travel."]];
const EMB: [string, string][] = [["حجز الموعد", "نحجز أقرب موعد متاح في السفارة ونذكّرك قبله."], ["مراجعة أخيرة", "نراجع الملف معك ورقةً ورقة قبل الموعد."], ["الحضور والتسليم", "تسلّم الطلب وتجيب عن أسئلة الموظف إن وُجدت، ونجهّزك لها مسبقاً."], ["فترة المعالجة", "نتابع حالة الطلب ونبلغك بأي تحديث أولاً بأول."], ["استلام الجواز", "تستلم جوازك والتأشيرة جاهزة للسفر."]];

/** Embassy destinations: the embassy day as five numbered stations on one line. */
export async function EmbassyDay({ c }: { c: Country }) {
  const tr = await getT();
  const emb = EMB.map(([h, p], i) => [tr(h, EMB_EN[i][0]), tr(p, EMB_EN[i][1])]);
  return (
    <section className="relative py-20 md:py-28">
      <div className="container-x">
        <Reveal><SectionHead center eyebrow="Embassy day" title={tr(`يوم سفارة ${c.name}… بلا مفاجآت`, `${c.name} embassy day, no surprises`)} text={tr("نرتّب كل خطوة قبل أن تصل إلى الشباك، فتدخل وأنت تعرف ما سيحدث بالضبط.", "We arrange every step before you reach the counter, so you walk in knowing exactly what will happen.")} /></Reveal>
        <Reveal className="emb relative grid gap-4 md:grid-cols-5">
          {emb.map(([h, p], i) => (
            <div key={h} data-r className="relative">
              <span className="emb-dot">{i + 1}</span>
              <div className="card mt-5 h-[calc(100%-3.6rem)] p-5 text-center"><h3 className="font-bold">{h}</h3><p className="mt-2 text-sm leading-7 text-mist/70">{p}</p></div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const CEN_EN: [string, string][] = [["Center appointment", "We book your slot at the visa center and send you the details."], ["Biometrics and photo", "You hand in the file and give fingerprints and a photo within minutes."], ["Track the application", "We follow your application number and tell you about every update."], ["Collect your passport", "You collect your passport from the center or by delivery, depending on the service available."]];
const CEN: [string, string][] = [["موعد المركز", "نحجز موعدك في مركز التأشيرات ونرسل لك التفاصيل."], ["البصمة والصورة", "تسلّم الملف وتسجّل البصمات والصورة خلال دقائق."], ["تتبّع الطلب", "نتابع رقم الطلب ونبلغك بكل تحديث."], ["استلام الجواز", "تستلم جوازك من المركز أو بالتوصيل حسب الخدمة المتاحة."]];

/** Visa-center destinations: four queue tickets, one per station. */
export async function CenterDay({ c }: { c: Country }) {
  const tr = await getT();
  const cen = CEN.map(([h, p], i) => [tr(h, CEN_EN[i][0]), tr(p, CEN_EN[i][1])]);
  return (
    <section className="relative overflow-hidden bg-ink/60 py-20 md:py-28">
      <div className="container-x">
        <Reveal><SectionHead eyebrow="Visa center" title={tr(`في مركز تأشيرات ${c.name}`, `At the ${c.name} visa center`)} text={tr("أربع محطات قصيرة، ونحن معك في كل واحدة منها.", "Four short stops, and we are with you at each one.")} /></Reveal>
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cen.map(([h, p], i) => (
            <div key={h} data-r className="ticket">
              <div className="ticket-top"><span className="font-serif text-xs tracking-[.3em] text-mist/55">TICKET</span><span className="font-serif text-3xl font-semibold text-[var(--accent)]" dir="ltr">A-0{i + 1}</span></div>
              <div className="ticket-body"><h3 className="font-bold">{h}</h3><p className="mt-2 text-sm leading-7 text-mist/70">{p}</p></div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
