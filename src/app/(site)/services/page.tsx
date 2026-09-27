import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ServiceStack from "@/components/ServiceStack";

export const metadata: Metadata = { title: "خدماتنا", description: "ست خدمات استشارية تغطي رحلة التأشيرة كاملة: التقييم، المستندات، النماذج، المواعيد، الخطابات، والمتابعة." };

export default async function ServicesPage() {
  const { services, site } = await getContent();
  return (
    <>
      <PageHero image="/img/p03.jpg" eyebrow="Services" title="ست خدمات… ملف واحد مكتمل" text="كل خدمة تغلق ثغرة من الثغرات التي تسبب الرفض. اطلبها منفردة أو كحزمة كاملة من الاستشارة حتى الجواز.">
        <div data-r className="mt-8 flex flex-wrap gap-2">
          {services.map((s, i) => <a key={s.title} href={`#s${i + 1}`} className="badge hover:border-sky"><span className="font-serif text-sky-2">0{i + 1}</span>{s.title}</a>)}
        </div>
      </PageHero>
      <section className="relative py-16 md:py-24"><div className="container-x"><ServiceStack /></div></section>
      <section className="pb-24">
        <Reveal className="container-x">
          <div data-r className="card beam grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
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
