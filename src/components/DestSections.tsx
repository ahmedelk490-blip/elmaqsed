import type { Country } from "@/lib/types";
import type { DestTheme } from "@/lib/destinations";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/** Five quick facts about the destination, each card topped with the flag accent. */
export function Glance({ c, t }: { c: Country; t: DestTheme }) {
  const items: [string, string][] = [[t.capLabel ?? "العاصمة", t.capital], ["العملة", t.currency], ["اللغة", t.language], ["التوقيت مقارنة بالرياض", t.tz], ["الطيران من الرياض", t.flight]];
  return (
    <section className="relative py-14 md:py-20">
      <div className="container-x">
        <Reveal><SectionHead eyebrow="At a glance" title={`${c.name} في سطور`} /></Reveal>
        <Reveal className="-mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {items.map(([k, v], i) => (
            <div key={k} data-r className={`card p-5 ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
              <span className="mb-3 block h-1 w-8 rounded-full bg-[var(--accent)]" />
              <p className="text-xs text-mist/55">{k}</p>
              <p className="mt-1.5 font-bold leading-7">{v}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-4 text-xs text-mist/45">معلومات عامة للاستئناس؛ مدة الطيران تقريبية وتختلف حسب شركة الطيران والموسم.</p>
      </div>
    </section>
  );
}

const EV: [string, string][] = [["تعبئة الطلب", "نعبّئ النموذج الإلكتروني بدقة نيابةً عنك."], ["رفع المستندات", "نجهّز الصور والمستندات بالمقاسات المطلوبة ونرفعها."], ["سداد الرسوم", "تدفع الرسوم الرسمية مباشرة عبر البوابة المعتمدة."], ["استلام التأشيرة", "تصلك التأشيرة على بريدك ونراجعها معك قبل السفر."]];

/** Online-visa destinations: a phone that cycles through the four screens of the application. */
export function EVisaFlow({ c }: { c: Country }) {
  return (
    <section className="relative overflow-hidden bg-ink/60 py-20 md:py-28">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <Reveal><SectionHead eyebrow="Online visa" title={`تأشيرة ${c.name} من شاشتك`} text="لا طوابير ولا زيارة سفارة. نتولى الطلب الإلكتروني كاملاً ونتابعه حتى تصلك التأشيرة." /></Reveal>
          <Reveal className="grid gap-3 sm:grid-cols-2">
            {EV.map(([h, p], i) => (
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
          {EV.map(([h], i) => (
            <div key={h} className={`phone-screen ${i === 0 ? "is-first" : ""}`} style={{ animationDelay: `${[0, -9, -6, -3][i]}s` }}>
              <p className="text-[11px] text-mist/55">الخطوة {i + 1} من 4</p>
              <p className="mt-1 text-lg font-bold">{h}</p>
              {i === 0 && <div className="mt-6 space-y-3">{["الاسم كما في الجواز", "رقم الجواز", "تاريخ السفر", "مدة الإقامة"].map((l) => <div key={l}><p className="mb-1 text-[10px] text-mist/50">{l}</p><div className="h-8 rounded-lg border border-white/10 bg-white/[.05]" /></div>)}</div>}
              {i === 1 && <div className="mt-6 grid grid-cols-2 gap-3">{["الجواز", "الصورة", "الحجز", "كشف الحساب"].map((l) => <div key={l} className="grid h-24 place-items-center rounded-xl border border-dashed border-white/20 text-center text-[11px] text-mist/60">{l}<span className="block text-[var(--accent)]">✓</span></div>)}</div>}
              {i === 2 && <div className="mt-8"><div className="rounded-xl border border-white/10 bg-white/[.04] p-4"><p className="text-[11px] text-mist/55">الرسوم الرسمية</p><p dir="ltr" className="mt-1 text-right font-serif text-2xl">e-Visa · {c.en}</p></div><div className="mt-5 h-11 rounded-full bg-[var(--accent)]" /></div>}
              {i === 3 && <div className="mt-10 grid place-items-center text-center"><span className="grid h-24 w-24 place-items-center rounded-full border-4 border-[var(--accent)] text-4xl text-[var(--accent)]">✓</span><p className="mt-5 font-bold">تمت الموافقة</p><p className="mt-1 text-xs text-mist/55">وصلت التأشيرة إلى بريدك</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const EMB: [string, string][] = [["حجز الموعد", "نحجز أقرب موعد متاح في السفارة ونذكّرك قبله."], ["مراجعة أخيرة", "نراجع الملف معك ورقةً ورقة قبل الموعد."], ["الحضور والتسليم", "تسلّم الطلب وتجيب عن أسئلة الموظف إن وُجدت، ونجهّزك لها مسبقاً."], ["فترة المعالجة", "نتابع حالة الطلب ونبلغك بأي تحديث أولاً بأول."], ["استلام الجواز", "تستلم جوازك والتأشيرة جاهزة للسفر."]];

/** Embassy destinations: the embassy day as five numbered stations on one line. */
export function EmbassyDay({ c }: { c: Country }) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container-x">
        <Reveal><SectionHead center eyebrow="Embassy day" title={`يوم سفارة ${c.name}… بلا مفاجآت`} text="نرتّب كل خطوة قبل أن تصل إلى الشباك، فتدخل وأنت تعرف ما سيحدث بالضبط." /></Reveal>
        <Reveal className="emb relative grid gap-4 md:grid-cols-5">
          {EMB.map(([h, p], i) => (
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

const CEN: [string, string][] = [["موعد المركز", "نحجز موعدك في مركز التأشيرات ونرسل لك التفاصيل."], ["البصمة والصورة", "تسلّم الملف وتسجّل البصمات والصورة خلال دقائق."], ["تتبّع الطلب", "نتابع رقم الطلب ونبلغك بكل تحديث."], ["استلام الجواز", "تستلم جوازك من المركز أو بالتوصيل حسب الخدمة المتاحة."]];

/** Visa-center destinations: four queue tickets, one per station. */
export function CenterDay({ c }: { c: Country }) {
  return (
    <section className="relative overflow-hidden bg-ink/60 py-20 md:py-28">
      <div className="container-x">
        <Reveal><SectionHead eyebrow="Visa center" title={`في مركز تأشيرات ${c.name}`} text="أربع محطات قصيرة، ونحن معك في كل واحدة منها." /></Reveal>
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CEN.map(([h, p], i) => (
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
