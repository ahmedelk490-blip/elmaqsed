import { getContent } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import TestiRail from "./TestiRail";
import BgImage from "./BgImage";

export default async function Testimonials() {
  const { testimonials } = await getContent();
  const items = [...testimonials, ...testimonials];
  return (
    <section id="testimonials" className="relative overflow-hidden bg-ink/70 py-24 md:py-32">
      <BgImage src="/img/p14.jpg" overlay="bg-gradient-to-b from-ink via-ink/85 to-ink" />
      <span className="ghost bottom-6 left-[-3%]">STORIES</span>
      <Reveal className="container-x relative">
        <SectionHead eyebrow="Stories" title="وصلوا إلى مقصدهم" text="قصص عملاء بدأت برسالة واتساب وانتهت بختم على الجواز." center />
      </Reveal>
      <div className="lg:hidden"><TestiRail items={testimonials} /></div>
      <div className="relative hidden lg:block" dir="ltr">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#07172e] to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#07172e] to-transparent md:w-32" />
        <div className="marquee marquee-slow flex w-max gap-5 px-2.5 py-3">
          {items.map((t, i) => (
            <figure key={i} dir="rtl" className="card flex w-[320px] shrink-0 flex-col p-7 md:w-[400px]">
              <span className="font-serif text-7xl leading-none text-sky/60">“</span>
              <blockquote className="-mt-4 flex-1 leading-9 text-mist/85">{t.text}</blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-mist/60">{t.city} · {t.visa}</p>
                </div>
                <span className="text-sm tracking-[.2em] text-sky-2">★★★★★</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
