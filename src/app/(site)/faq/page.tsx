import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FaqExplorer from "@/components/FaqExplorer";

export const metadata: Metadata = { title: "الأسئلة الشائعة", description: "مركز المساعدة: إجابات صريحة عن الضمان، الرسوم، المستندات، والتقديم بعد الرفض." };

export default function FaqPage() {
  return (
    <>
      <PageHero image="/img/p08.jpg" eyebrow="Help center" title="مركز المساعدة" text="ابحث في الأسئلة أو تصفح حسب التصنيف. إجابات صريحة بلا مجاملات." />
      <section className="py-16 md:py-24"><div className="container-x"><FaqExplorer /></div></section>
    </>
  );
}
