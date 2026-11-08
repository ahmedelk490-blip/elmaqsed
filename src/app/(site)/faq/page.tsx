import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getLocalContent } from "@/lib/content";
import { getT, getLang } from "@/lib/i18n";
import PageHero from "@/components/PageHero";
import FaqExplorer from "@/components/FaqExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({ lang: await getLang(), path: "/faq", title: t("الأسئلة الشائعة", "FAQ"), description: t("مركز المساعدة: إجابات صريحة عن الضمان، الرسوم، المستندات، والتقديم بعد الرفض.", "Help center: straight answers on guarantees, fees, documents and applying after a refusal.") });
}

export default async function FaqPage() {
  const t = await getT();
  const { faq } = await getLocalContent();
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero image="/img/p08.jpg" eyebrow="Help center" title={t("مركز المساعدة", "Help center")} text={t("ابحث في الأسئلة أو تصفح حسب التصنيف. إجابات صريحة بلا مجاملات.", "Search the questions or browse by category. Straight answers, no sugar-coating.")} />
      <section className="py-16 md:py-24"><div className="container-x"><FaqExplorer /></div></section>
    </>
  );
}
