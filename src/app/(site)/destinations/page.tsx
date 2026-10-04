import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/PageHero";
import DestinationsExplorer from "@/components/DestinationsExplorer";

export const metadata: Metadata = pageMeta({ path: "/destinations", title: "الوجهات", description: "ابحث عن وجهتك وفلتر حسب نوع التقديم: دول شنغن، أمريكا، بريطانيا، الإمارات، تركيا، ماليزيا وغيرها." });

export default function DestinationsPage() {
  return (
    <>
      <PageHero image="/img/p06.jpg" eyebrow="Destinations" title="بطاقة صعودك تبدأ من هنا" text="ابحث عن وجهتك، فلتر حسب نوع التقديم، واطلع على المدة والمتطلبات قبل أن تتواصل معنا." />
      <section className="py-16 md:py-24">
        <div className="container-x"><DestinationsExplorer /></div>
      </section>
    </>
  );
}
