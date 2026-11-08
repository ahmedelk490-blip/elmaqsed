import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getT } from "@/lib/i18n";
import PageHero from "@/components/PageHero";
import DestinationsExplorer from "@/components/DestinationsExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return pageMeta({
    path: "/destinations",
    title: t("الوجهات", "Destinations"),
    description: t("ابحث عن وجهتك وفلتر حسب نوع التقديم: دول شنغن، أمريكا، بريطانيا، الإمارات، تركيا، ماليزيا وغيرها.", "Find your destination and filter by application type: Schengen countries, the USA, the UK, the UAE, Turkey, Malaysia and more."),
  });
}

export default async function DestinationsPage() {
  const t = await getT();
  return (
    <>
      <PageHero image="/img/p06.jpg" eyebrow="Destinations" title={t("بطاقة صعودك تبدأ من هنا", "Your boarding pass starts here")} text={t("ابحث عن وجهتك، فلتر حسب نوع التقديم، واطلع على المدة والمتطلبات قبل أن تتواصل معنا.", "Find your destination, filter by application type, and see the timing and requirements before you contact us.")} />
      <section className="py-16 md:py-24">
        <div className="container-x"><DestinationsExplorer /></div>
      </section>
    </>
  );
}
