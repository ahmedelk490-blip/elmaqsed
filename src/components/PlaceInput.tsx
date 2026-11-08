"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLACES, suggest, type Place } from "@/lib/places";
import { useLang } from "./ContentProvider";

// English country names for the Arabic country shown under each city
const COUNTRY_EN = new Map(PLACES.filter((p) => p.k === "دولة").map((p) => [p.n, p.e ?? p.n]));
let airportCache: Place[][] | null = null;

/**
 * Text input that suggests cities and countries as soon as part of a name is typed. The list is drawn in a fixed layer,
 * so sections with overflow:hidden never clip it. Free text is still accepted.
 * With `airports`, the international airports list (IATA code, name, city) is loaded on first focus and suggested first.
 */
export default function PlaceInput({ value, onChange, className, placeholder, required, places, airports }: { value: string; onChange: (v: string) => void; className?: string; placeholder?: string; required?: boolean; places?: Place[]; airports?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const en = useLang() === "en";
  const [air, setAir] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [box, setBox] = useState<{ left: number; top: number; width: number } | null>(null);
  const base = places ? (en ? places.map((p) => (p.k === "eSIM" ? { n: p.e ?? p.n, k: p.k, e: p.n } : p)) : places) : (en ? PLACES.map((p) => ({ n: p.e ?? p.n, k: p.k === "دولة" ? "Country" : COUNTRY_EN.get(p.k) ?? p.k, e: p.n })) : PLACES);
  const list = open ? suggest(value, 7, air.length ? [...air, ...base] : base) : [];
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
  const loadAirports = () => {
    if (!airports || air.length) return;
    if (airportCache) return setAir(airportCache[en ? 1 : 0]);
    void import("@/lib/airports").then(({ AIRPORTS }) => {
      airportCache = [
        AIRPORTS.map(([c, n, city, country, nEn, cityEn, countryEn]) => ({ n: `${n} (${c})`, k: `${city}، ${country}`, e: `${c} ${nEn ?? ""} ${cityEn ?? ""}` })),
        AIRPORTS.map(([c, n, city, country, nEn, cityEn, countryEn]) => ({ n: `${nEn || n} (${c})`, k: `${cityEn || city}, ${countryEn || country}`, e: `${c} ${n} ${city}` })),
      ];
      setAir(airportCache[en ? 1 : 0]);
    });
  };

  const pick = (n: string) => { onChange(n); setOpen(false); };
  return (
    <>
      <input
        ref={ref} value={value} required={required} placeholder={placeholder} className={className}
        autoComplete="off" role="combobox" aria-expanded={show} aria-autocomplete="list"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); loadAirports(); }}
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
        <ul className="place-list" role="listbox" data-lenis-prevent style={{ left: box.left, top: box.top, width: box.width }}>
          {list.map((p, i) => (
            <li key={`${p.n}-${p.k}`} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p.n)} onMouseEnter={() => setHi(i)} className={i === hi ? "is-on" : ""}>
                <b>{p.n}</b><span dir="auto">{p.k === "eSIM" ? (en ? "eSIM" : p.e) : p.k}</span>
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
