import { getContent } from "@/lib/content";

export default async function Marquee() {
  const { countries } = await getContent();
  const items = [...countries, ...countries];
  return (
    <div className="relative z-10 overflow-hidden border-y border-white/5 bg-ink/70 py-4" dir="ltr" aria-hidden="true">
      <div className="marquee flex w-max items-center gap-12">
        {items.map((c, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap text-sm text-mist/80">
            <span className={`fi fi-${c.code} rounded-sm`} />
            <span className="font-bold text-white">{c.name}</span>
            <span className="font-serif tracking-[.25em] text-mist/60">{c.en.toUpperCase()}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky" />
          </span>
        ))}
      </div>
    </div>
  );
}
