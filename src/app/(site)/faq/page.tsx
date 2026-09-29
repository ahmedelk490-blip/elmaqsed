import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getContent } from "@/lib/content";
import PageHero from "@/components/PageHero";
import FaqExplorer from "@/components/FaqExplorer";

export const metadata: Metadata = pageMeta({ path: "/faq", title: "الأسئلة الشائعة", description: "مركز المساعدة: إجابات صريحة عن الضمان، الرسوم، المستندات، والتقديم بعد الرفض." });

export default async function FaqPage() {
  const { faq } = await getContent();
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero image="/img/p08.jpg" eyebrow="Help center" title="مركز المساعدة" text="ابحث في الأسئلة أو تصفح حسب التصنيف. إجابات صريحة بلا مجاملات." />
      <section className="py-16 md:py-24"><div className="container-x"><FaqExplorer /></div></section>
    </>
  );
}
