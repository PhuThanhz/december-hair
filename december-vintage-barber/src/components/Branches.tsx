"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BRANCHES, directionsUrl, type Dict } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION, ScrollTrigger } from "@/lib/gsap";

import FastMarquee from "react-fast-marquee";

// MapLibre (~320 KB + its CSS) only downloads once the map is about to scroll into view
const loadMap = () => import("./BranchMap");
const BranchMap = dynamic(loadMap, { ssr: false });

function MarqueeBanner({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="group relative block w-full overflow-hidden bg-[#122017] text-paper border-y border-sage/20 py-2.5 sm:py-3 cursor-pointer hover:bg-forest transition-colors duration-500 select-none shadow-sm"
    >
      <FastMarquee
        direction="left"
        speed={22}
        pauseOnHover={true}
        autoFill={true}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-5 sm:gap-8 pr-5 sm:pr-8">
          <span className="font-serif text-base sm:text-lg lg:text-xl text-paper tracking-tight font-normal">
            {text}
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="font-serif italic text-base sm:text-lg lg:text-xl text-sage font-normal">
            December Hair
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="font-mono text-[10px] sm:text-[11px] text-paper/70 tracking-[0.22em] uppercase">
            Praha · Kladno · Mladá Boleslav
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="font-serif italic text-base sm:text-lg lg:text-xl text-paper/85">
            Kadeřnictví pro ženy, muže i děti
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper/10 text-[11px] font-sans tracking-wide text-sage border border-sage/25 group-hover:bg-paper group-hover:text-forest transition-all duration-300">
            Rezervovat termín →
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
        </div>
      </FastMarquee>
    </div>
  );
}

export default function Branches({ t, onBook }: { t: Dict; onBook: (branchId?: string) => void }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const activeBranch = BRANCHES.find((b) => b.id === active);
  const mapBox = useRef<HTMLDivElement | null>(null);
  const [mapNear, setMapNear] = useState(false);

  // Fetch and parse MapLibre while the browser is idle after load, so it doesn't stall the scroll
  // when the map comes near. Skipped for visitors on data saver.
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const id = window.setTimeout(() => idle(() => void loadMap()), 4000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = mapBox.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setMapNear(true);
        io.disconnect();
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.from("[data-br-title] [data-line]", {
          yPercent: 110,
          duration: 1.4,
          ease: EASE,
          scrollTrigger: { trigger: "[data-br-title]", start: "top 85%" },
        });
        gsap.from("[data-map]", {
          autoAlpha: 0,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-map]", start: "top 85%" },
        });
        gsap.from("[data-branch]", {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          ease: EASE,
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-branch-list]", start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <>
      <section ref={root} id="pobocky" className="relative bg-paper px-5 sm:px-8 lg:px-12 py-28 sm:py-40">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14 sm:mb-20">
            <h2 data-br-title className="font-serif text-[20vw] md:text-[11vw] leading-[0.82] tracking-[-0.04em]">
              <span className="line-mask">
                <span data-line className="block">{t.branchesTitle}</span>
              </span>
            </h2>
            <p className="text-ink-soft max-w-xs pb-4">{t.branchesNote}</p>
          </div>

          <div className="grid grid-cols-12 gap-x-8 gap-y-10">
            {/* Map */}
            <div className="col-span-12 lg:col-span-7 lg:order-2">
              <div
                ref={mapBox}
                data-map
                className="relative h-[60svh] lg:h-[78svh] lg:sticky lg:top-20 overflow-hidden rounded-[2px] bg-celadon"
              >
                {mapNear && <BranchMap active={active} onSelect={setActive} labels={{ map: t.mapStreet, aerial: t.mapAerial }} />}
                <p className="pointer-events-none absolute left-4 top-4 label text-ink-soft bg-paper/85 px-3 py-1.5 rounded-full">
                  {active ? BRANCHES.find((b) => b.id === active)?.mall : t.mapHint}
                </p>
                {activeBranch && (
                  <a
                    href={directionsUrl(activeBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-4 bottom-4 z-10 inline-flex items-center gap-2 rounded-full bg-paper text-ink pl-3.5 pr-4 py-3 text-sm font-medium shadow-md hover:bg-forest hover:text-paper transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                    {t.mapOpenGoogle} ↗
                  </a>
                )}
              </div>
            </div>

            {/* List */}
            <ul data-branch-list className="col-span-12 lg:col-span-5 lg:order-1 border-t border-ink/80">
              {BRANCHES.map((b) => {
                const on = active === b.id;
                return (
                  <li
                    key={b.id}
                    data-branch
                    className={`relative border-b px-6 transition-colors duration-500 ${
                      on ? "bg-forest text-paper border-forest" : "border-ink/15 hover:bg-bone/60"
                    }`}
                  >
                    <button
                      onClick={() => setActive(on ? null : b.id)}
                      className="w-full text-left cursor-pointer pt-7 pb-3 group flex items-baseline justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                      aria-pressed={on}
                    >
                      <span
                        className={`block font-serif text-4xl sm:text-[2.75rem] leading-none tracking-[-0.02em] transition-colors duration-300 ${
                          on ? "text-paper" : "group-hover:text-moss"
                        }`}
                      >
                        {b.city}
                      </span>
                      <span className={`label tabular-nums ${on ? "text-sage" : "text-ink-soft"}`}>{b.hours}</span>
                    </button>

                    <div className={`pb-7 text-sm space-y-1 ${on ? "text-paper/70" : "text-ink-soft"}`}>
                      <p className={on ? "text-paper" : "text-ink"}>{b.mall}</p>
                      <p>{b.address}</p>
                      <div className="flex flex-wrap items-center gap-2.5 pt-4">
                        <a
                          href={directionsUrl(b)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2.5 transition-colors ${
                            on ? "bg-paper text-forest hover:bg-sage" : "bg-forest text-paper hover:bg-moss"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                            <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
                            <circle cx="12" cy="9.5" r="2.5" />
                          </svg>
                          {t.map}
                        </a>
                        <a
                          href={`tel:${b.phoneRaw}`}
                          className={`inline-flex items-center gap-2 rounded-full border pl-3.5 pr-4 py-2.5 transition-colors tabular-nums ${
                            on ? "border-paper/30 text-paper hover:border-paper" : "border-ink/20 text-ink hover:border-ink"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                          </svg>
                          {b.phone}
                        </a>
                        <button
                          onClick={() => onBook(b.id)}
                          className={`cursor-pointer rounded-full border px-4 py-2.5 transition-colors ${
                            on ? "border-paper/30 text-paper hover:border-paper" : "border-ink/20 text-ink hover:border-ink"
                          }`}
                        >
                          {t.book} →
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <MarqueeBanner text={t.marquee} onClick={() => onBook()} />
    </>
  );
}
