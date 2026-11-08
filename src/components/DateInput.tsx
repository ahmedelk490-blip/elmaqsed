"use client";
import { Icon } from "./Icons";
import { useLang } from "./ContentProvider";

const mk = (l: string) => ({
  date: new Intl.DateTimeFormat(l, { day: "numeric", month: "long", year: "numeric" }),
  month: new Intl.DateTimeFormat(l, { month: "long", year: "numeric" }),
});
const FMT = { ar: mk("ar-SA-u-ca-gregory-nu-latn"), en: mk("en-GB") };

/** Form date / month field that reads as text ("اختر التاريخ", then "20 يناير 2027"); the native picker lies invisibly on top. */
export default function DateInput({ value, onChange, min, type = "date", className = "", ariaLabel, reveal }: { value: string; onChange: (v: string) => void; min?: string; type?: "date" | "month"; className?: string; ariaLabel?: string; reveal?: boolean }) {
  const en = useLang() === "en";
  const shown = value ? FMT[en ? "en" : "ar"][type].format(new Date(type === "month" ? `${value}-01T00:00:00` : `${value}T00:00:00`)) : type === "month" ? (en ? "Choose month" : "اختر الشهر") : en ? "Choose date" : "اختر التاريخ";
  return (
    <span data-r={reveal ? "" : undefined} className={`field date-field ${className}`}>
      <span className={value ? "" : "date-empty"}>{shown}</span>
      <Icon name="calendar" className="h-5 w-5 shrink-0 text-sky-2" />
      <input
        type={type} min={min} value={value} aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* opens by itself where showPicker is not allowed */ } }}
      />
    </span>
  );
}
