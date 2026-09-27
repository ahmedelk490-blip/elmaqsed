import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import DrawIcon from "@/components/DrawIcon";
import { Icon } from "@/components/Icons";
import Image from "next/image";

export const metadata: Metadata = { title: "خدماتنا", description: "ست خدمات استشارية تغطي رحلة التأشيرة كاملة: التقييم، المستندات، النماذج، المواعيد، الخطابات، والمتابعة." };

export default async function ServicesPage() {
  const { services, site } = await getContent();
  return (
    <>
      <PageHero image="/img/p03.jpg" eyebrow="Services" title="ست خدمات… ملف واحد مكتمل" text="كل خدمة تغلق ثغرة من الثغرات التي تسبب الرفض. اطلبها منفردة أو كحزمة كاملة من الاستشارة حتى الجواز." />
      <section className="pb-24">
        <div className="container-x grid gap-12 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block">
            <ol className="sticky top-28 space-y-3 border-r border-white/10 pr-5 text-sm text-mist/60">
              {services.map((s, i) => (
                <li key={s.title}><a href={`#s${i + 1}`} className="flex gap-3 transition-colors hover:text-white"><span className="font-serif text-sky-2">0{i + 1}</span>{s.title}</a></li>
              ))}
            </ol>
          </aside>
          <div className="space-y-6">
            {services.map((s, i) => (
              <Reveal key={s.title}>
                <article id={`s${i + 1}`} className="card grid gap-8 p-7 md:grid-cols-[150px_1fr] md:p-10 lg:grid-cols-[150px_1fr_240px]">
                  <div data-r className="flex items-center gap-5 md:flex-col">
                    <DrawIcon name={s.icon} />
                    <span className="font-serif text-5xl text-sky-2/70">0{i + 1}</span>
                  </div>
                  <div>
                    <h2 data-r className="text-2xl font-bold md:text-3xl">{s.title}</h2>
                    <p data-r className="mt-4 leading-9 text-mist/75">{s.text}</p>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                      {s.bullets.map((b) => <li key={b} data-r className="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm leading-7"><span className="mb-3 grid h-6 w-6 place-items-center rounded-full bg-sky/15 text-sky-2"><Icon name="check" className="h-3.5 w-3.5" /></span>{b}</li>)}
                    </ul>
                  </div>
                  <div data-r className="relative hidden h-full min-h-[220px] overflow-hidden rounded-2xl lg:block"><Image src={s.img} alt="" fill sizes="240px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" /></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-24">
        <Reveal className="container-x">
          <div data-r className="card grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <h2 className="text-2xl font-bold">الرسوم واضحة قبل البدء</h2>
              <p className="mt-3 leading-8 text-mist/75">رسوم السفارة تُدفع للجهة الرسمية وتختلف حسب الدولة. رسوم خدمتنا تُعلن لك بعد الاستشارة المجانية وقبل أي التزام.</p>
            </div>
            <a href={waLink(site.whatsapp, "السلام عليكم، أرغب بمعرفة رسوم الخدمة")} target="_blank" rel="noopener" className="btn btn-primary">اسأل عن الرسوم</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
