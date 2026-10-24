"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Dict } from "@/content/types";
import { useContent, useLang } from "@/content/ContentProvider";
import { directionsUrl, findBranch } from "@/content/helpers";
import { hoursSummary } from "@/lib/hours";
import { gsap, useGSAP, EASE, MQ_MOTION, ScrollTrigger, getLenis } from "@/lib/gsap";
import { useInView } from "@/lib/useInView";

import FastMarquee from "react-fast-marquee";

// MapLibre (~320 KB + its CSS) only downloads once the map is about to scroll into view
const loadMap = () => import("./BranchMap");
const BranchMap = dynamic(loadMap, { ssr: false });

function MarqueeBanner({ text, tagline, cities, onClick }: { text: string; tagline: string; cities: string; onClick: () => void }) {
  const box = useRef<HTMLDivElement | null>(null);
  const inView = useInView(box);
  return (
    <div
      ref={box}
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
        play={inView}
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
            {cities}
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="font-serif italic text-base sm:text-lg lg:text-xl text-paper/85">
            {tagline}
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper/10 text-[11px] font-sans tracking-wide text-sage border border-sage/25 group-hover:bg-paper group-hover:text-forest transition-all duration-300">
            {text} →
          </span>
          <span className="text-sage/60 text-[10px] sm:text-xs">✦</span>
        </div>
      </FastMarquee>
    </div>
  );
}

export default function Branches({ t, onBook }: { t: Dict; onBook: (branchId?: string) => void }) {
  const { branches } = useContent();
  const lang = useLang();
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const activeBranch = findBranch(branches, active);
  const mapBox = useRef<HTMLDivElement | null>(null);
  const [mapNear, setMapNear] = useState(false);
  // Card and pin light up together, whichever one the pointer is on
  const [hover, setHover] = useState<string | null>(null);

  const list = useRef<HTMLUListElement | null>(null);
  // Once the visitor hovers or picks a salon, the demo below stops for good
  const touched = useRef(false);

  // First time the list is in view, light each card and its pin in turn, once: it shows,
  // without any hovering, that card and map belong together and the cards can be pressed
  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const step = 900;
        branches.forEach((b, i) =>
          timers.push(window.setTimeout(() => !touched.current && setHover(b.id), 1200 + i * step))
        );
        timers.push(window.setTimeout(() => !touched.current && setHover(null), 1200 + branches.length * step));
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [branches]);

  // Only a moving pointer counts as the visitor's own hover (cards also slide under a resting one while scrolling)
  const hoverBy = (id: string | null) => {
    touched.current = true;
    setHover(id);
  };

  // On phones the map sits above the list, so bring it into view to show where it flies
  const pick = (id: string | null) => {
    touched.current = true;
    setActive(id);
    const el = mapBox.current;
    if (!id || !el || window.matchMedia("(min-width: 1024px)").matches) return;
    const top = el.getBoundingClientRect().top;
    if (top > 64 && top < window.innerHeight * 0.5) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

          <div className="grid grid-cols-12 lg:gap-x-8 gap-y-10">
            {/* Map */}
            <div className="col-span-12 lg:col-span-7 lg:order-2">
              <div
                ref={mapBox}
                data-map
                className="relative h-[60svh] lg:h-[78svh] lg:sticky lg:top-20 overflow-hidden rounded-[2px] bg-celadon"
              >
                {mapNear && (
                  <BranchMap
                    active={active}
                    onSelect={setActive}
                    hover={hover}
                    onHover={hoverBy}
                    labels={{ map: t.mapStreet, aerial: t.mapAerial, aria: t.mapAria }}
                  />
                )}
                <p className="pointer-events-none absolute left-4 top-4 label text-ink-soft bg-paper/85 px-3 py-1.5 rounded-full">
                  {activeBranch ? activeBranch.mall : t.mapHint}
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
            <ul ref={list} data-branch-list className="col-span-12 lg:col-span-5 lg:order-1 border-t border-ink/80">
              {branches.map((b) => {
                const on = active === b.id;
                const lit = hover === b.id && !on;
                return (
                  <li
                    key={b.id}
                    data-branch
                    onMouseMove={() => hoverBy(b.id)}
                    onMouseLeave={() => touched.current && setHover(null)}
                    className={`relative border-b px-6 transition-colors duration-500 ${
                      on ? "bg-forest text-paper border-forest" : `border-ink/15 ${lit ? "bg-bone/60" : ""}`
                    }`}
                  >
                    {/* Name, mall and address are one target: it shows the salon on the map */}
                    <button
                      onClick={() => pick(on ? null : b.id)}
                      className="w-full text-left cursor-pointer pt-7 pb-1 group block outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                      aria-pressed={on}
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-3.5">
                          {/* The same pin as on the map, so card and pin read as one */}
                          <span
                            aria-hidden
                            className={`relative grid place-items-center w-9 h-9 shrink-0 rounded-full ring-[3px] transition-[transform,background-color] duration-500 ${
                              on ? "bg-moss ring-paper/25 scale-110" : lit ? "bg-moss ring-paper scale-110" : "bg-forest ring-paper"
                            }`}
                          >
                            <img src="/images/logo-d-white.png" alt="" loading="lazy" className="w-[52%] h-[52%] object-contain" />
                          </span>
                          <span
                            className={`block font-serif text-4xl sm:text-[2.75rem] leading-none tracking-[-0.02em] transition-colors duration-300 ${
                              on ? "text-paper" : lit ? "text-moss" : ""
                            }`}
                          >
                            {b.city[lang]}
                          </span>
                        </span>
                        <span className={`label tabular-nums ${on ? "text-sage" : "text-ink-soft"}`}>
                          {hoursSummary(b, t.aboutDays, t.closed)}
                        </span>
                      </span>
                      {/* The address sits in a tile with an arrow: it reads as pressable before any hover */}
                      <span
                        className={`mt-5 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-colors duration-500 ${
                          on ? "border-paper/25 bg-paper/5" : lit ? "border-moss bg-paper" : "border-ink/15 bg-paper/70"
                        }`}
                      >
                        <span className={`min-w-0 block text-sm space-y-0.5 ${on ? "text-paper/70" : "text-ink-soft"}`}>
                          <span className={`block ${on ? "text-paper" : "text-ink"}`}>{b.mall}</span>
                          <span className="block">{b.address}</span>
                          <span className={`block pt-1.5 text-[13px] font-medium ${on ? "text-sage" : "text-moss"}`}>
                            {on ? t.mapBack : t.mapShow}
                          </span>
                        </span>
                        {/* A map pin, not an arrow: when this salon is on the map it pulses like its pin there */}
                        <span
                          aria-hidden
                          className={`relative grid place-items-center w-10 h-10 shrink-0 rounded-full border transition-colors duration-500 ${
                            on ? "border-moss bg-moss text-paper" : lit ? "border-forest bg-forest text-paper" : "border-ink/20 text-forest"
                          }`}
                        >
                          {on && <span className="absolute inset-0 rounded-full bg-moss animate-[dh-pulse_1.8s_ease-out_infinite]" />}
                          <svg
                            viewBox="0 0 24 24"
                            className={`relative w-[18px] h-[18px] transition-transform duration-500 ${lit ? "-translate-y-0.5" : ""}`}
                            fill={on ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
                            <circle cx="12" cy="9.5" r="2.5" fill={on ? "var(--color-moss)" : "none"} stroke={on ? "none" : "currentColor"} />
                          </svg>
                        </span>
                      </span>
                    </button>

                    <div className="pb-7 text-sm">
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

      <MarqueeBanner
        text={t.marquee}
        tagline={t.marqueeTagline}
        cities={branches.map((b) => b.city[lang]).join(" · ")}
        onClick={() => onBook()}
      />
    </>
  );
}
