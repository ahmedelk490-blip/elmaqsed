"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { suggest, type Place } from "@/lib/places";

/**
 * Text input that suggests cities and countries as soon as part of a name is typed. The list is drawn in a fixed layer,
 * so sections with overflow:hidden never clip it. Free text is still accepted.
 */
export default function PlaceInput({ value, onChange, className, placeholder, required, places }: { value: string; onChange: (v: string) => void; className?: string; placeholder?: string; required?: boolean; places?: Place[] }) {
  const ref = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [box, setBox] = useState<{ left: number; top: number; width: number } | null>(null);
  const list = open ? suggest(value, 7, places) : [];
  const show = list.length > 0 && !(list.length === 1 && list[0].n === value.trim());

  useLayoutEffect(() => {
    if (!show) return;
    const place = () => {
      const r = (ref.current?.closest(".hs-field, .fl") ?? ref.current)?.getBoundingClientRect();
      if (r) setBox({ left: r.left, top: r.bottom + 6, width: Math.max(r.width, 240) });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [show, value]);
  useEffect(() => setHi(0), [value]);

  const pick = (n: string) => { onChange(n); setOpen(false); };
  return (
    <>
      <input
        ref={ref} value={value} required={required} placeholder={placeholder} className={className}
        autoComplete="off" role="combobox" aria-expanded={show} aria-autocomplete="list"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((hi + 1) % list.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((hi - 1 + list.length) % list.length); }
          else if (e.key === "Enter") { e.preventDefault(); pick(list[hi].n); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {show && box && createPortal(
        <ul className="place-list" role="listbox" style={{ left: box.left, top: box.top, width: box.width }}>
          {list.map((p, i) => (
            <li key={`${p.n}-${p.k}`} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p.n)} onMouseEnter={() => setHi(i)} className={i === hi ? "is-on" : ""}>
                <b>{p.n}</b><span dir="auto">{p.k === "eSIM" ? p.e : p.k}</span>
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
