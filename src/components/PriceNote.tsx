/** What the service price covers. The wording comes from the client; a price shows only when one is set for the destination. */
export default function PriceNote({ price, includes, excludes, className = "" }: { price?: string; includes?: string; excludes?: string; className?: string }) {
  return (
    <div className={`price-note ${className}`}>
      {price ? <p className="mb-2 flex items-baseline gap-3"><span className="text-sm text-mist/60">السعر</span><b className="text-2xl text-white">{price}</b></p> : <p className="mb-2 font-semibold text-white">السعر النهائي يصلك بعد مراجعة طلبك، وقبل أي التزام.</p>}
      <p><b className="text-sky-2">السعر يشمل:</b> {includes || "رسوم الموعد والخدمة والترجمة والضريبة"}*</p>
      <p><b className="text-mist">السعر لا يشمل:</b> {excludes || "رسوم السفارة ورسوم توصيل الجواز من المركز الموحد للتأشيرات"}</p>
    </div>
  );
}
