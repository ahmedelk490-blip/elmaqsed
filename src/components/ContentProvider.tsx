"use client";
import { createContext, useContext } from "react";
import type { Content } from "@/lib/types";
import { tFor, type Lang } from "@/lib/lang";

const Ctx = createContext<{ c: Content; lang: Lang } | null>(null);

export function ContentProvider({ value, lang = "ar", children }: { value: Content; lang?: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={{ c: value, lang }}>{children}</Ctx.Provider>;
}

function useCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContent must be used inside ContentProvider");
  return c;
}

export const useContent = (): Content => useCtx().c;
export const useLang = (): Lang => useCtx().lang;
/** Text picker for client components: const t = useT(); t("احجز الآن", "Book now"). */
export const useT = () => tFor(useCtx().lang);
