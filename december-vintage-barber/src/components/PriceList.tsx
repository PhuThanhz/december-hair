"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, HAIR_LENGTHS, type Category, type Dict, type HairLength, type Lang, type Service } from "@/content/types";
import { useContent } from "@/content/ContentProvider";
import { priceFor } from "@/content/helpers";
import { czk as fmt, mins } from "@/lib/format";
import { gsap, useGSAP, EASE, MQ_MOTION } from "@/lib/gsap";

const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);

/**
 * "Build your visit": tick the services you want and a receipt prints beside
 * the list with the total price and time in the chair, ready to book.
 * Driven entirely by the services in the content, so the back office can add or change rows freely.
 * Services priced by hair length follow the length picked above the list.
 */
export default function PriceList({
  t,
  lang,
  onBook,
}: {
  t: Dict;
  lang: Lang;
  onBook: (c: Category, note: string) => void;
}) {
  const { services } = useContent();
  const root = useRef<HTMLElement | null>(null);
  const totalEl = useRef<HTMLSpanElement | null>(null);
  const shown = useRef(0);
  // Start with the first service ticked, so the receipt shows how it works
  const [picked, setPicked] = useState<string[]>(services.length ? [services[0].id] : []);
  const [inView, setInView] = useState(false);
  const [length, setLength] = useState<HairLength>("short");
  const byLength = services.some((s) => s.lengthPrices);
  const lengthName = t.hairLengths[HAIR_LENGTHS.indexOf(length)];

  const chosen = services.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((sum, s) => sum + priceFor(s, length), 0);
  const time = chosen.reduce((sum, s) => sum + s.durationMin, 0);
  const fromPrice = chosen.some((s) => s.priceFrom);
  const groups = CATEGORIES.map((c) => ({ cat: c, items: services.filter((s) => s.category === c) })).filter((g) => g.items.length);
  const name = (s: Service) => s.name[lang];
  // What the salon reads in the booking: the hair length too, where it sets the price
  const booked = (s: Service) => (s.lengthPrices ? `${name(s)} (${t.hairLength.toLowerCase()}: ${lengthName.toLowerCase()})` : name(s));

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const bookSelection = () => {
    if (!chosen.length) return;
    onBook(chosen[0].category, `${t.servicesLabel}: ${chosen.map(booked).join(", ")}`);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.fromTo(
          "[data-price-title] [data-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.4, ease: EASE, scrollTrigger: { trigger: "[data-price-title]", start: "top 85%" } }
        );
        gsap.fromTo(
          "[data-receipt]",
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: "[data-receipt]", start: "top 85%" } }
        );
        gsap.utils.toArray<HTMLElement>("[data-group]").forEach((g) => {
          gsap.fromTo(
            g.querySelectorAll("[data-row]"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: g, start: "top 85%" } }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // The total rolls to its new value, like a till
  useEffect(() => {
    const el = totalEl.current;
    if (!el) return;
    const from = shown.current;
    shown.current = total;
    if (!window.matchMedia(MQ_MOTION).matches || !el.textContent) {
      el.textContent = fmt(total);
      return;
    }
    const o = { v: from };
    const tw = gsap.to(o, { v: total, duration: 0.8, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)) });
    return () => {
      tw.kill();
    };
  }, [total]);

  // Mobile summary bar only while the price list is on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} id="cenik" className="relative bg-paper px-5 sm:px-8 lg:px-12 py-28 sm:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 data-price-title className="font-serif text-[18vw] lg:text-[8vw] leading-[0.82] tracking-[-0.04em]">
              <span className="line-mask">
                <span data-line className="block">{t.pricesTitle}</span>
              </span>
            </h2>
          </div>
          <div className="max-w-sm pb-2">
            <p className="font-serif italic text-4xl text-moss">{t.pricesLead}</p>
            <p className="mt-3 text-ink-soft">{t.pricesHow}</p>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 grid grid-cols-12 lg:gap-x-10 xl:gap-x-20 gap-y-14 items-start">
          {/* The menu: tap a row to add or remove it */}
          <div className="col-span-12 lg:col-span-7 space-y-12">
            {byLength && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3" role="radiogroup" aria-label={t.hairLength}>
                <span className="label text-ink-soft">{t.hairLength}</span>
                <div className="inline-flex rounded-full border border-ink/20 p-1">
                  {HAIR_LENGTHS.map((len, i) => (
                    <button
                      key={len}
                      role="radio"
                      aria-checked={length === len}
                      onClick={() => setLength(len)}
                      className={`cursor-pointer rounded-full px-4 sm:px-5 py-2 text-sm transition-colors duration-300 ${
                        length === len ? "bg-forest text-paper" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {t.hairLengths[i]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {groups.map((g, gi) => (
              <div key={g.cat} data-group>
                <div className="flex items-baseline gap-4 border-b border-ink pb-3">
                  <span className="label text-ink-soft tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                  <h3 className="font-serif text-3xl sm:text-4xl leading-none">{t.cat[g.cat]}</h3>
                </div>
                <ul>
                  {g.items.map((s) => {
                    const on = picked.includes(s.id);
                    return (
                      <li key={s.id} data-row className="border-b border-ink/10">
                        <button
                          onClick={() => toggle(s.id)}
                          aria-pressed={on}
                          className={`group w-full text-left cursor-pointer px-3 sm:px-4 py-5 grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-5 transition-colors duration-300 ${
                            on ? "bg-celadon/45" : "hover:bg-bone/50"
                          }`}
                        >
                          <span
                            className={`mt-2 grid place-items-center w-[18px] h-[18px] border transition-colors duration-300 ${
                              on ? "bg-forest border-forest text-paper" : "border-ink/30 group-hover:border-ink"
                            }`}
                            aria-hidden
                          >
                            {on && (
                              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M2 6.5 5 9l5-6" />
                              </svg>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-baseline gap-3">
                              <span className={`font-serif text-2xl sm:text-[1.75rem] leading-tight ${on ? "text-forest" : ""}`}>
                                {name(s)}
                              </span>
                              <span className="leader" aria-hidden />
                              <span className="price text-lg sm:text-xl">
                                {s.priceFrom && <span className="text-xs font-normal text-ink-soft mr-1">{t.servicesFrom}</span>}
                                {fmt(priceFor(s, length))} Kč
                              </span>
                            </span>
                            <span className="mt-1.5 flex justify-between gap-4 text-sm text-ink-soft">
                              <span>{[s.note[lang], s.lengthPrices && lengthName].filter(Boolean).join(" · ")}</span>
                              <span className="tabular-nums whitespace-nowrap">{mins(s.durationMin)}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* The bill: what you picked, how long, how much */}
          <aside className="col-span-12 lg:col-span-5 lg:sticky lg:top-24">
            <div data-receipt className="bill p-7 sm:p-9 text-ink">
              <div className="flex items-baseline justify-between pb-5 border-b border-ink">
                <span className="font-serif text-2xl">{t.receiptTitle}</span>
                <span className="label text-ink-soft tabular-nums">{String(chosen.length).padStart(2, "0")}</span>
              </div>

              <ul className="min-h-[120px]">
                {chosen.length === 0 && <li className="py-10 text-center text-sm text-ink-soft">{t.receiptEmpty}</li>}
                {chosen.map((s) => (
                  <li key={s.id} className="receipt-line group py-4 border-b border-dashed border-ink/15">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-lg leading-snug">{name(s)}</span>
                      <span className="leader" aria-hidden />
                      <span className="price">
                        {s.priceFrom && <span className="text-[11px] font-normal text-ink-soft mr-1">{t.servicesFrom}</span>}
                        {fmt(priceFor(s, length))} Kč
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                      <span className="tabular-nums">
                        {mins(s.durationMin)}
                        {s.lengthPrices && ` · ${lengthName}`}
                      </span>
                      <button
                        onClick={() => toggle(s.id)}
                        aria-label={`${t.receiptClear} ${name(s)}`}
                        className="cursor-pointer px-1 opacity-60 hover:opacity-100 hover:text-ink transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-60"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="pt-5 space-y-4">
                <div className="flex items-baseline justify-between text-sm">
                  <dt className="text-ink-soft">{t.receiptTime}</dt>
                  <dd className="price">{chosen.length ? hm(time) : "—"}</dd>
                </div>
                <div className="flex items-end justify-between border-t border-ink pt-4">
                  <dt>
                    <span className="label block">{t.receiptTotal}</span>
                    <span className="mt-1 block text-xs text-ink-soft">{t.receiptVat}</span>
                  </dt>
                  <dd className="price text-5xl sm:text-[3.5rem] leading-none font-normal tracking-[-0.03em] text-forest">
                    {fromPrice && <span className="text-sm text-ink-soft mr-1.5 tracking-normal">{t.servicesFrom}</span>}
                    <span ref={totalEl} />
                    <span className="text-xl text-ink-soft ml-2 tracking-normal">Kč</span>
                  </dd>
                </div>
              </dl>

              <button
                onClick={bookSelection}
                disabled={!chosen.length}
                className="mt-8 w-full cursor-pointer rounded-full bg-forest text-paper py-4 text-sm font-medium tracking-wide hover:bg-moss transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t.receiptBook} →
              </button>

              <div className="mt-4 flex items-start justify-between gap-3 text-[11px] leading-relaxed text-ink-soft">
                <span>{t.receiptFoot}</span>
                {chosen.length > 0 && (
                  <button onClick={() => setPicked([])} className="link-line cursor-pointer shrink-0">
                    {t.receiptClear}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: running total pinned to the bottom while choosing */}
      <div
        className={`lg:hidden fixed inset-x-4 bottom-4 z-40 rounded-full bg-forest text-paper pl-6 pr-2 py-2 flex items-center justify-between shadow-xl transition-[opacity,transform] duration-500 ${
          inView && chosen.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <span className="price text-xl">
          {fromPrice && <span className="text-xs font-normal opacity-60 mr-1">{t.servicesFrom}</span>}
          {fmt(total)} Kč <span className="text-xs font-normal opacity-60">· {hm(time)}</span>
        </span>
        <button onClick={bookSelection} className="rounded-full bg-paper text-forest px-5 py-2.5 text-sm cursor-pointer">
          {t.pricesBook} →
        </button>
      </div>
    </section>
  );
}
