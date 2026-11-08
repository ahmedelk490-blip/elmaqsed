"use client";
import { useT } from "./ContentProvider";

/** What the service price covers. The wording comes from the client; a price shows only when one is set for the destination. */
export default function PriceNote({ price, includes, excludes, className = "" }: { price?: string; includes?: string; excludes?: string; className?: string }) {
  const t = useT();
  return (
    <div className={`price-note ${className}`}>
      {price ? <p className="mb-2 flex items-baseline gap-3"><span className="text-sm text-mist/60">{t("السعر", "Price")}</span><b className="text-2xl text-white">{price}</b></p> : <p className="mb-2 font-semibold text-white">{t("السعر النهائي يصلك بعد مراجعة طلبك، وقبل أي التزام.", "You get the final price after we review your request, before any commitment.")}</p>}
      <p><b className="text-sky-2">{t("السعر يشمل:", "Price includes:")}</b> {includes || t("رسوم الموعد والخدمة والترجمة والضريبة", "appointment fees, service, translation and tax")}*</p>
      <p><b className="text-mist">{t("السعر لا يشمل:", "Price excludes:")}</b> {excludes || t("رسوم السفارة ورسوم توصيل الجواز من المركز الموحد للتأشيرات", "embassy fees and passport delivery fees from the visa centre")}</p>
    </div>
  );
}
