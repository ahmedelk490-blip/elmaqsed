import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import ApplyFlow from "@/components/ApplyFlow";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = pageMeta({ path: "/apply", title: "قدّم طلبك", description: "قدّم على تأشيرتك أو اطلب حجز فندقك في ثلاث خطوات قصيرة، ويصلنا طلبك جاهزاً على واتساب." });

export default function ApplyPage() {
  return (
    <section className="relative overflow-hidden pt-[84px]">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-sky/15 blur-[120px]" />
      <div className="relative mx-auto w-[min(100%-2rem,48rem)] py-12 md:py-20">
        <Reveal className="mb-8 text-center">
          <p data-r className="eyebrow mb-4">Apply</p>
          <h1 data-r className="text-[2rem] font-bold leading-[1.3] md:text-5xl">قدّم طلبك في ثلاث خطوات</h1>
          <p data-r className="mx-auto mt-4 max-w-xl leading-8 text-mist/80">املأ البيانات، راجعها، ثم أرسلها لنا على واتساب. نرد خلال 24 ساعة بالمتطلبات والسعر النهائي.</p>
        </Reveal>
        <Suspense fallback={<div className="card h-80" />}><ApplyFlow /></Suspense>
      </div>
    </section>
  );
}
