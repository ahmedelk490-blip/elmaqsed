import Image from "next/image";

/** Full-bleed brand photograph behind a section, with a gradient overlay for legibility and an optional slow Ken Burns drift. */
export default function BgImage({ src, overlay = "bg-gradient-to-b from-navy/70 via-navy/60 to-navy", className = "", priority = false, kenburns = false, position = "50% 50%" }: { src: string; overlay?: string; className?: string; priority?: boolean; kenburns?: boolean; position?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <Image src={src} alt="" fill sizes="100vw" priority={priority} className={`object-cover ${kenburns ? "kenburns" : ""}`} style={{ objectPosition: position }} />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}
