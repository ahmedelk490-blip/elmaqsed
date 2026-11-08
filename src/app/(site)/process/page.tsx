import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLocalContent } from "@/lib/content";
import { getT, getLang } from "@/lib/i18n";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import RouteLine from "@/components/RouteLine";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({ lang: await getLang(), path: "/process", title: t("كيف نعمل", "How we work"), description: t("خمس محطات واضحة من أول رسالة إلى ختم الجواز: التقييم، خطة المستندات، التجهيز والتقديم، الموعد والمقابلة، والمتابعة.", "Five clear stops from the first message to the passport stamp: assessment, document plan, preparation and filing, appointment and interview, and follow-up.") });
}

const before = [["جواز سفر ساري لأكثر من 6 أشهر", "A passport valid for more than 6 months"], ["فكرة عن موعد السفر ومدته", "An idea of your travel dates and length of stay"], ["معرفة إن كان لديك رفض سابق", "Whether you have a previous refusal"], ["حساب واتساب للمتابعة", "A WhatsApp account for follow-up"]];

export default async function ProcessPage() {
  const t = await getT();
  const { site } = await getLocalContent();
  return (
    <>
      <PageHero image="/img/p05.jpg" eyebrow="How it works" title={t("خط واحد… من أول رسالة إلى ختم الجواز", "One line… from the first message to the passport stamp")} text={t("خمس محطات واضحة. في كل محطة تعرف بالضبط ما الذي يحدث، وما المطلوب منك، وكم يستغرق.", "Five clear stops. At each one you know exactly what is happening, what we need from you, and how long it takes.")} />
      <section className="py-16 md:py-24"><div className="container-x"><RouteLine /></div></section>
      <section className="pb-24">
        <Reveal className="container-x grid gap-6 md:grid-cols-2">
          <div data-r className="card p-8">
            <h2 className="text-2xl font-bold">{t("قبل أن تبدأ", "Before you start")}</h2>
            <ul className="mt-5 space-y-3 text-mist/80">{before.map(([ar, en]) => <li key={ar} className="flex gap-3"><span className="text-sky-2">✓</span>{t(ar, en)}</li>)}</ul>
          </div>
          <div data-r className="card glow p-8">
            <h2 className="text-2xl font-bold">{t("كم يستغرق كل شيء؟", "How long does it all take?")}</h2>
            <p className="mt-4 leading-8 text-mist/75">{t("التقييم خلال 24 ساعة، تجهيز الملف من 3 إلى 7 أيام حسب اكتمال مستنداتك، ثم مدة السفارة حسب الوجهة.", "Assessment within 24 hours, file preparation in 3 to 7 days depending on how complete your documents are, then the embassy processing time for your destination.")}</p>
            <a href={waLink(site.whatsapp, t("السلام عليكم، أرغب في استشارة بخصوص تأشيرة السفر", "Hello, I would like a consultation about a travel visa"))} target="_blank" rel="noopener" className="btn btn-primary mt-6">{t("ابدأ التقييم المجاني", "Start your free assessment")}</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
