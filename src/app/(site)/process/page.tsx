import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import RouteLine from "@/components/RouteLine";

export const metadata: Metadata = pageMeta({ path: "/process", title: "كيف نعمل", description: "خمس محطات واضحة من أول رسالة إلى ختم الجواز: التقييم، خطة المستندات، التجهيز والتقديم، الموعد والمقابلة، والمتابعة." });

const before = ["جواز سفر ساري لأكثر من 6 أشهر", "فكرة عن موعد السفر ومدته", "معرفة إن كان لديك رفض سابق", "حساب واتساب للمتابعة"];

export default async function ProcessPage() {
  const { site } = await getContent();
  return (
    <>
      <PageHero image="/img/p05.jpg" eyebrow="How it works" title="خط واحد… من أول رسالة إلى ختم الجواز" text="خمس محطات واضحة. في كل محطة تعرف بالضبط ما الذي يحدث، وما المطلوب منك، وكم يستغرق." />
      <section className="py-16 md:py-24"><div className="container-x"><RouteLine /></div></section>
      <section className="pb-24">
        <Reveal className="container-x grid gap-6 md:grid-cols-2">
          <div data-r className="card p-8">
            <h2 className="text-2xl font-bold">قبل أن تبدأ</h2>
            <ul className="mt-5 space-y-3 text-mist/80">{before.map((x) => <li key={x} className="flex gap-3"><span className="text-sky-2">✓</span>{x}</li>)}</ul>
          </div>
          <div data-r className="card glow p-8">
            <h2 className="text-2xl font-bold">كم يستغرق كل شيء؟</h2>
            <p className="mt-4 leading-8 text-mist/75">التقييم خلال 24 ساعة، تجهيز الملف من 3 إلى 7 أيام حسب اكتمال مستنداتك، ثم مدة السفارة حسب الوجهة.</p>
            <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-primary mt-6">ابدأ التقييم المجاني</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
