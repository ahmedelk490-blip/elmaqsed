"use client";

/** − n + stepper with a label and an optional age note. */
export default function Counter({ label, hint, value, min, max = 20, onChange }: { label: string; hint?: string; value: number; min: number; max?: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3">
      <span className="whitespace-nowrap text-sm font-semibold">{label}{hint && <small className="block text-xs font-normal text-mist/65">{hint}</small>}</span>
      <span className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`تقليل ${label}`} className="cnt-btn">−</button>
        <b className="w-5 text-center">{value}</b>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`زيادة ${label}`} className="cnt-btn">+</button>
      </span>
    </div>
  );
}
