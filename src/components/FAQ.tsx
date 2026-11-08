"use client";
import { useEffect, useRef, useState } from "react";
import { useContent, useT } from "./ContentProvider";
import { waLink } from "@/lib/types";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import Symbol from "./Symbol";
import { Icon } from "./Icons";

const STEP = 7000; // ms each question stays on the desk while it plays by itself

/**
 * FAQ as an advisor's desk: an index of questions beside a chat panel where the advisor "types" the answer.
 * Plays through the questions by itself while in view; picking one stops the autoplay. On phones the index is a swipe rail.
 */
export default function FAQ({ compact = false }: { compact?: boolean }) {
  const { faq, site } = useContent();
  const t = useT();
  const items = compact ? faq.slice(0, 4) : faq;
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  const still = useRef(false);

  useEffect(() => {
    still.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still.current) setAuto(false);
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const go = (n: number, byUser: boolean) => {
    if (byUser) setAuto(false);
    setI(n);
    setTyping(!still.current);
  };

  // autoplay
  useEffect(() => {
    if (!auto || !seen) return;
    const t = setTimeout(() => go((i + 1) % items.length, false), STEP);
    return () => clearTimeout(t);
  }, [i, auto, seen, items.length]);

  // the advisor "types" for a moment before the answer appears
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 900);
    return () => clearTimeout(t);
  }, [typing, i]);

  // on the phone rail, bring the active question to the middle (scrolls the rail only, never the page)
  useEffect(() => {
    const r = rail.current, el = r?.children[i] as HTMLElement | undefined;
    if (!r || !el || getComputedStyle(r).overflowX !== "auto") return;
    const a = el.getBoundingClientRect(), b = r.getBoundingClientRect();
    r.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: still.current ? "auto" : "smooth" });
  }, [i]);

  const f = items[i];
  return (
    <section id="faq" ref={ref} className="on-light relative overflow-clip py-24 md:py-32">
      <div className="container-x relative">
        <Reveal>
          <SectionHead
            eyebrow="FAQ"
            title={compact ? t("أسئلة شائعة", "Common questions") : t("اسأل المستشار… قبل أن تبدأ", "Ask the advisor… before you start")}
            text={compact ? undefined : t("أكثر ما يسألنا عنه العملاء، وإجابات المستشار كما يقولها لك في أول اتصال: صريحة وبلا مجاملات.", "What clients ask us most, answered the way the advisor would on a first call: straight and honest.")}
            link={compact ? undefined : { href: "/faq", label: t("كل الأسئلة والبحث", "All questions and search") }}
          />
        </Reveal>
        <Reveal className="faq-board">
          <ol ref={rail} data-r className="faq-index" role="tablist" aria-label={t("الأسئلة", "Questions")}>
            {items.map((q, n) => (
              <li key={q.q}>
                <button type="button" role="tab" aria-selected={n === i} onClick={() => go(n, true)} className={`faq-q ${n === i ? "is-on" : ""}`}>
                  <span className="faq-cat">{q.cat}</span>
                  <span className="faq-text">{q.q}</span>
                  {n === i && auto && seen && <span key={i} className="faq-prog" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ol>

          <div data-r className="faq-desk on-dark" role="tabpanel" aria-live="polite">
            <div className="faq-head">
              <span className="faq-avatar"><Symbol className="h-6 w-6 text-white" id="faq-av" /></span>
              <span className="min-w-0 flex-1"><b className="block">{t("مستشار المقصد", "ELMAQSED advisor")}</b><small className="faq-online">{t("متاح الآن · يرد خلال ساعات العمل", "Available now · replies during working hours")}</small></span>
            </div>
            <div className="faq-chat">
              <p key={`q${i}`} className="faq-bubble faq-me">{f.q}</p>
              {typing
                ? <p className="faq-bubble faq-us faq-typing" aria-label={t("المستشار يكتب", "The advisor is typing")}><i /><i /><i /></p>
                : <p key={`a${i}`} className="faq-bubble faq-us">{f.a}</p>}
            </div>
            <div className="faq-foot">
              <p className="text-sm leading-7 text-mist/75">{t("لم تجد سؤالك؟ اكتبه للمستشار مباشرة.", "Can't find your question? Ask the advisor directly.")}</p>
              <a href={waLink(site.whatsapp, t("السلام عليكم، لدي سؤال: ", "Hello, I have a question: "))} target="_blank" rel="noopener" className="btn btn-primary btn-sm shrink-0">{t("اسأل على واتساب", "Ask on WhatsApp")} <Icon name="arrow" className="h-4 w-4" /></a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
