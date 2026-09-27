"use client";
import { useEffect, useState } from "react";
import { useContent } from "./ContentProvider";

/** Mobile hero: one chip that cycles through destinations with a slide-up. */
export default function ChipTicker() {
  const { countries } = useContent();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % Math.max(countries.length, 1)), 2200);
    return () => clearInterval(t);
  }, [countries.length]);
  const c = countries[i];
  if (!c) return null;
  return <span key={c.slug} className="chip ticker inline-flex"><i /><span className={`fi fi-${c.code} rounded-sm`} />{c.name} · جاهز للتقديم</span>;
}
