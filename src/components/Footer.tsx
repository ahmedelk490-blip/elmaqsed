import Link from "next/link";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/types";
import Reveal from "./Reveal";
import Symbol from "./Symbol";
import Globe from "./Globe";
import { Icon } from "./Icons";

const WA = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

/** Globe footer: the spinning world with our flight routes on one side, brand, contact and links on the other. */
export default async function Footer() {
  const { site, nav, countries } = await getContent();
  const row = "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 transition-colors hover:border-sky/50 hover:bg-sky/10";
  return (
    <footer className="font-alex relative overflow-hidden bg-[linear-gradient(180deg,#0b1f39_0%,#06132a_45%,#050f22_100%)]">
      <div className="dots-bg absolute inset-0 opacity-60" />
      <Reveal className="container-x relative grid items-center gap-12 pb-12 pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:pt-28">
        {/* globe */}
        <div data-r className="relative mx-auto w-[min(80vw,460px)]">
          <div className="absolute inset-[-12%] rounded-full bg-sky/15 blur-[80px]" />
          <Globe className="relative" />
          <p className="absolute inset-x-0 -bottom-2 text-center font-serif text-[11px] tracking-[.3em] text-mist/55">RIYADH → THE WORLD</p>
        </div>
        {/* brand + contact */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-r src="/brand/logo.svg" alt="المقصد ELMAQSED" className="h-12 w-auto" />
          <h2 data-r className="mt-8 text-3xl font-bold leading-[1.25] md:text-5xl">من الرياض… إلى {countries.length} وجهة حول العالم</h2>
          <p data-r className="mt-5 max-w-lg text-lg leading-9 text-mist/75">{site.footerNote}</p>
          <div data-r className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className={`${row} sm:col-span-2 border-sky/40 bg-sky/10`}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sky text-white"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d={WA} /></svg></span>
              <span><span className="block text-sm text-mist/60">استشارة مجانية عبر واتساب</span><span className="font-semibold" dir="ltr">+{site.whatsapp}</span></span>
            </a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className={row}><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sky-2"><Icon name="phone" className="h-5 w-5" /></span><span className="font-semibold" dir="ltr">{site.phone}</span></a>
            <a href={`mailto:${site.email}`} className={row}><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sky-2"><Icon name="letter" className="h-5 w-5" /></span><span className="font-semibold">{site.email}</span></a>
          </div>
          <p data-r className="mt-4 text-sm text-mist/50">{site.city}<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>{site.hours}</p>
        </div>
      </Reveal>

      {/* link columns */}
      <div className="container-x relative border-t border-white/10 py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          <div>
            <h3 className="foot-h"><span>PAGES</span>الصفحات</h3>
            <ul className="foot-list">{nav.map((n) => <li key={n.href}><Link href={n.href}>{n.label}</Link></li>)}</ul>
          </div>
          <div className="md:order-last">
            <h3 className="foot-h"><span>VISIT US</span>المقر وساعات العمل</h3>
            <p className="leading-8 text-mist/80">{site.city}</p>
            <p className="mt-1 text-sm leading-7 text-mist/55">{site.hours}</p>
            <a href={waLink(site.whatsapp)} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-5">احجز استشارة</a>
          </div>
          <div className="col-span-2">
            <h3 className="foot-h"><span>VISAS</span>التأشيرات</h3>
            <ul className="foot-list grid-cols-2 gap-x-8">{countries.map((c) => <li key={c.slug}><Link href={`/visa/${c.slug}`}><span className={`fi fi-${c.code} rounded-sm`} />تأشيرة {c.name}</Link></li>)}</ul>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center gap-4 py-7 text-center text-sm md:flex-row md:justify-between md:text-start">
          <p className="text-mist/55">© {new Date().getFullYear()} · جميع الحقوق محفوظة</p>
          <Symbol className="hidden h-6 w-6 text-white/35 md:block" id="foot-mini" />
          <a href="https://qmarketingeg.com/" target="_blank" rel="noopener" className="font-semibold text-white transition-colors hover:text-sky-2">تصميم وبرمجة شركة Q Marketing</a>
        </div>
      </div>
    </footer>
  );
}
