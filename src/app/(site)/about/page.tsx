import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getContent } from "@/lib/content";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import SymbolConverge from "@/components/SymbolConverge";

export const metadata: Metadata = pageMeta({ path: "/about", title: "من نحن", description: "قصة المقصد: شركة سعودية مرخصة لاستشارات تأشيرات السفر، وفلسفة الاتجاه والوصول التي بُنيت عليها العلامة." });

export default async function AboutPage() {
  const { about, site, why } = await getContent();
  return (
    <>
      <PageHero image="/img/p07.jpg" eyebrow="About Elmaqsed" title={about.title} text={about.intro} />
      <section className="py-16 md:py-24">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <SymbolConverge />
          <Reveal>
            <p data-r className="eyebrow mb-5">The story</p>
            {about.story.map((p, i) => (
              <p key={i} data-r className={i === 0 ? "text-2xl font-semibold leading-10 text-white md:text-3xl md:leading-[1.7]" : "mt-6 text-lg leading-9 text-mist/80"}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="bg-ink/60 py-16 md:py-24">
        <Reveal className="container-x">
          <SectionHead eyebrow="Values" title="ما نؤمن به" center />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {about.values.map((v, i) => (
              <div key={v.title} data-r className="card p-5 text-center sm:p-7">
                <span className="font-serif text-3xl text-sky-2">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold sm:text-2xl">{v.title}</h3>
                <p className="mt-3 leading-8 text-mist/75">{v.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="py-16 md:py-24">
        <Reveal className="container-x grid gap-6 md:grid-cols-2">
          <div data-r className="card p-8">
            <p className="eyebrow mb-4">Licensed</p>
            <h2 className="text-2xl font-bold">شركة مرخصة ومستقلة</h2>
            <ul className="mt-5 space-y-2 text-mist/80">
              <li>السجل التجاري: <span dir="ltr">{site.cr}</span></li>
              <li>ترخيص وزارة السياحة: <span dir="ltr">{site.license}</span></li>
              <li>{site.city}</li>
            </ul>
            <p className="mt-5 text-sm leading-7 text-mist/50">{site.disclaimer}</p>
          </div>
          <div data-r className="card glow p-8">
            <p className="eyebrow mb-4">Why us</p>
            <ul className="space-y-4">{why.map((w) => <li key={w.title}><h3 className="font-bold">{w.title}</h3><p className="text-sm leading-7 text-mist/70">{w.text}</p></li>)}</ul>
          </div>
        </Reveal>
      </section>
    </>
  );
}
