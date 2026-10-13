import { getContent } from "@/lib/content";
import { Icon } from "./Icons";

/** Round call button for phones and tablets: one tap opens the dialler with the number set in the dashboard. */
export default async function CallFloat() {
  const { site } = await getContent();
  const number = site.phone.replace(/[^\d+]/g, "");
  if (!number) return null;
  return (
    <a
      href={`tel:${number}`}
      aria-label={`اتصل بنا ${site.phone}`}
      className="fixed bottom-5 left-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-sky/40 bg-gradient-to-br from-sky-2 to-sky text-white shadow-[0_10px_40px_rgba(46,148,210,.45)] lg:hidden"
    >
      <span className="wa-ring" />
      <Icon name="phone" className="relative h-6 w-6" />
    </a>
  );
}
