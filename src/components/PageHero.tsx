import Image from "next/image";
import Reveal from "./Reveal";

/** Top block for inner pages: title column beside the brand photo in its own frame, so text never sits on the photo. */
export default function PageHero({ eyebrow, title, text, image, children }: { eyebrow: string; title: string; text?: string; image?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-[84px]">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[30rem] w-[50rem] rounded-full bg-sky/15 blur-[120px]" />
      <div className={`container-x relative grid items-center gap-10 py-12 md:py-20 ${image ? "lg:grid-cols-[1.15fr_.85fr] lg:gap-16" : ""}`}>
        <Reveal>
          <p data-r className="eyebrow mb-5">{eyebrow}</p>
          <h1 data-r className="max-w-4xl text-balance text-[2.3rem] font-bold leading-[1.3] md:text-6xl">{title}</h1>
          {text && <p data-r className="mt-6 max-w-2xl text-lg leading-9 text-mist/85">{text}</p>}
          {children}
        </Reveal>
        {image && (
          <div className="ph-frame relative aspect-[16/11] overflow-hidden rounded-[2rem] border border-white/10">
            <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="kenburns object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
            <span className="ph-tag" dir="ltr">ELMAQSED · {eyebrow}</span>
          </div>
        )}
      </div>
    </section>
  );
}
