import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLocalContent } from "@/lib/content";
import { getT, getLang } from "@/lib/i18n";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import ServiceStack from "@/components/ServiceStack";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({ lang: await getLang(), path: "/services", title: t("خدماتنا", "Our services"), description: t("ست خدمات استشارية تغطي رحلة التأشيرة كاملة: التقييم، المستندات، النماذج، المواعيد، الخطابات، والمتابعة.", "Six consulting services covering the whole visa journey: assessment, documents, forms, appointments, letters and follow-up.") });
}

export default async function ServicesPage() {
  const t = await getT();
  const { services, site } = await getLocalContent();
  return (
    <>
      <PageHero image="/img/p03.jpg" eyebrow="Services" title={t("ست خدمات… ملف واحد مكتمل", "Six services… one complete file")} text={t("كل خدمة تغلق ثغرة من الثغرات التي تسبب الرفض. اطلبها منفردة أو كحزمة كاملة من الاستشارة حتى الجواز.", "Each service closes one of the gaps that cause refusals. Order them one by one or as a full package, from consultation to passport.")}>
        <div data-r className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {services.map((s, i) => <a key={s.title} href={`#s${i + 1}`} className="svc-jump"><span className="font-serif text-sky-2">0{i + 1}</span>{s.title}</a>)}
        </div>
      </PageHero>
      <section className="relative py-16 md:py-24"><div className="container-x"><ServiceStack /></div></section>
      <section className="pb-24">
        <Reveal className="container-x">
          <div data-r className="card beam grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <h2 className="text-2xl font-bold">{t("الرسوم واضحة قبل البدء", "Fees are clear before we start")}</h2>
              <p className="mt-3 leading-8 text-mist/75">{t("رسوم السفارة تُدفع للجهة الرسمية وتختلف حسب الدولة. رسوم خدمتنا تُعلن لك بعد الاستشارة المجانية وقبل أي التزام.", "Embassy fees are paid to the official body and vary by country. Our service fee is shared with you after the free consultation and before any commitment.")}</p>
            </div>
            <a href={waLink(site.whatsapp, t("السلام عليكم، أرغب بمعرفة رسوم الخدمة", "Hello, I would like to know the service fees"))} target="_blank" rel="noopener" className="btn btn-primary">{t("اسأل عن الرسوم", "Ask about fees")}</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
