import Reveal from "./Reveal";
import BgImage from "./BgImage";

/** Cinematic top block for inner pages: brand photo, eyebrow, big Kufi title, intro, optional extra content. */
export default function PageHero({ eyebrow, title, text, image, children }: { eyebrow: string; title: string; text?: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden pt-[84px]">
      {image ? <BgImage src={image} priority kenburns overlay="bg-gradient-to-b from-navy/60 via-navy/55 to-navy" /> : <div className="grid-bg absolute inset-0" />}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-sky/15 blur-[120px]" />
      <Reveal className="container-x relative py-16 md:py-24">
        <p data-r className="eyebrow mb-5">{eyebrow}</p>
        <h1 data-r className="max-w-4xl text-balance text-[2.4rem] font-bold leading-[1.25] md:text-6xl">{title}</h1>
        {text && <p data-r className="mt-6 max-w-2xl text-lg leading-9 text-mist/85">{text}</p>}
        {children}
      </Reveal>
    </section>
  );
}
