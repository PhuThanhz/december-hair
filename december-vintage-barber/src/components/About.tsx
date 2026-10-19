"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Dict, Service } from "@/content/types";
import { useContent, useLang } from "@/content/ContentProvider";
import { daysOpen, latestClose, pragueNow } from "@/lib/hours";
import { czk, mins } from "@/lib/format";
import { gsap, useGSAP, ScrollTrigger, EASE, MQ_MOTION } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];

// Which services each clip stands for (Service.id), and where booking it starts
const CLIP_SERVICES: Record<Clip, { services: string[]; category?: Category }> = {
  cut: { services: ["kids-cut", "mens-cut", "fade-beard", "cut-blowdry"] },
  colour: { services: ["colour-highlights", "balayage"], category: "women" },
  care: { services: ["wash-massage", "head-spa"], category: "spa" },
};

/** "od 390 Kč · 30–60 min" for each clip, straight from the price list; null when none of its services is listed */
function clipFacts(services: Service[]) {
  return Object.fromEntries(
    CLIPS.map((c) => {
      const list = services.filter((s) => CLIP_SERVICES[c].services.includes(s.id));
      if (!list.length) return [c, null];
      const cheapest = list.reduce((a, b) => (b.price < a.price ? b : a));
      const lo = Math.min(...list.map((s) => s.durationMin));
      const hi = Math.max(...list.map((s) => s.durationMin));
      return [c, { from: czk(cheapest.price), time: lo === hi ? mins(lo) : `${lo}–${hi} min` }];
    })
  ) as Record<Clip, { from: string; time: string } | null>;
}

/**
 * "Three salons, one team", then the three things we do as huge words. The word crossing the
 * middle of the screen comes alive: its clip runs through the letters and plays, sharp, in the
 * frame beside them. Below, three facts: where, which days, until when.
 *
 * Video-in-text without masks: inside an isolated box, white paper with black letters is
 * "screen"-blended over the clip (black letters let it through, white stays white), then a
 * paper-coloured layer is "multiply"-blended so the white matches the page.
 */
export default function About({ t, onBook }: { t: Dict; onBook: (c?: Category, note?: string) => void }) {
  const { branches, services, siteMedia } = useContent();
  const lang = useLang();
  const facts = useMemo(() => clipFacts(services), [services]);
  // Latest closing time across the salons, and on how many weekdays one of them is open
  const close = latestClose(branches);
  const days = daysOpen(branches);
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");

  // The running clip's progress, drawn under the word and under the mirror at once
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const frame = el.querySelector<HTMLVideoElement>(`[data-frame="${active}"]`);
    const inText = el.querySelector<HTMLVideoElement>(`[data-intext="${active}"]`);
    const bars = el.querySelectorAll<HTMLElement>("[data-progress]");
    // Phones hide the mirror, so the word's own clip is the clock there
    const mirrorShown = !!frame?.offsetParent;
    const video = mirrorShown ? frame : inText;
    // The word and the mirror show the same moment of the clip
    if (mirrorShown && frame && inText) inText.currentTime = frame.currentTime;
    let raf = 0;
    const loop = () => {
      const p = video && video.duration ? video.currentTime / video.duration : 0;
      bars.forEach((b) => (b.style.transform = `scaleX(${b.dataset.progress === active ? p : 0})`));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  // Clock-dependent, so only known on the client
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  useEffect(() => {
    const tick = () => setToday(pragueNow().weekday);
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  useGSAP(
    () => {
      // The word crossing the middle of the screen is the one alive
      gsap.utils.toArray<HTMLElement>("[data-verb]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          // Exactly one word holds the middle line at a time, so clips never fight over it
          start: "top center",
          end: "bottom center",
          onToggle: (st) => st.isActive && setActive(el.dataset.verb as Clip),
        });
      });

      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.fromTo(
          "[data-about-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 75%" } }
        );
        gsap.fromTo(
          "[data-about-fade]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 70%" } }
        );
        gsap.utils.toArray<HTMLElement>("[data-verb]").forEach((el) => {
          gsap.fromTo(el, { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%" } });
        });
        // The counts roll up from zero when the facts arrive
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const to = Number(el.dataset.count);
          const o = { v: 0 };
          gsap.to(o, {
            v: to,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => (el.textContent = String(Math.round(o.v))),
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
        gsap.fromTo(
          "[data-day]",
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: "[data-days]", start: "top 90%" } }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // What it is, what it costs, book it: under the mirror on desktop, under the words on phones
  const plate = (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="label text-ink-soft tabular-nums">0{CLIPS.indexOf(active) + 1} / 03</p>
        <p className="mt-1 font-serif italic text-3xl leading-none text-forest">{t.aboutClips[active]}</p>
        {facts[active] && (
          <p className="mt-2 text-sm text-ink-soft whitespace-nowrap">
            {t.servicesFrom} <span className="price text-ink">{facts[active].from} Kč</span> · {facts[active].time}
          </p>
        )}
      </div>
      <button
        onClick={() => onBook(CLIP_SERVICES[active].category, t.aboutClips[active])}
        className="shrink-0 cursor-pointer rounded-full bg-forest text-paper px-5 py-2.5 text-sm hover:bg-moss transition-colors duration-500"
      >
        {t.book} →
      </button>
    </div>
  );

  const goBranches = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection("#pobocky");
  };

  return (
    <section ref={root} className="relative bg-paper px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 lg:gap-x-8 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.03em]">
            {t.aboutTitle.map((line, i) => (
              <span key={i} className="line-mask">
                <span data-about-line className={`block ${i === 1 ? "italic text-moss" : ""}`}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p data-about-fade className="col-span-12 lg:col-span-4 lg:col-start-9 text-lg leading-relaxed text-ink-soft">
            {t.aboutText}
          </p>
        </div>

        <div className="mt-14 sm:mt-20 grid grid-cols-12 lg:gap-x-8 gap-y-8">
          {/* The clip, sharp and in full, in an arched mirror like the ones in the salons */}
          <div className="hidden lg:block col-span-12 lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-t-full border border-forest/30 p-2 sm:p-2.5">
                <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-t-full bg-bone">
                  {CLIPS.map((c) => (
                    <video
                      key={c}
                      data-frame={c}
                      src={siteMedia.aboutClips[c].src}
                      data-poster={siteMedia.aboutClips[c].poster}
                      data-hold={c !== active || undefined}
                      muted
                      loop
                      playsInline
                      preload="none"
                      aria-label={t.aboutClips[c]}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${c === active ? "opacity-100" : "opacity-0"}`}
                    />
                  ))}
                  <span className="absolute inset-x-0 bottom-0 h-[3px] bg-paper/30" />
                  <span data-progress={active} className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-paper" />
                </div>
              </div>

              <div className="mt-5">{plate}</div>
            </div>
          </div>

          {/* The three things we do; the one in focus has its clip running through the letters */}
          <div className="col-span-12 lg:col-span-8 lg:row-start-1 border-t border-ink/15">
            {CLIPS.map((c, i) => {
              const on = c === active;
              return (
                <button
                  key={c}
                  data-verb={c}
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  aria-label={t.aboutClips[c]}
                  className="relative isolate block w-full cursor-pointer overflow-hidden border-b border-ink/15 text-left"
                >
                  <video
                    data-intext={c}
                    src={siteMedia.aboutClips[c].src}
                    data-poster={siteMedia.aboutClips[c].poster}
                    data-hold={!on || undefined}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden
                    // Inset 1px so the clip's anti-aliased edge stays under the white sheet (no grey frame line)
                    className={`absolute inset-px w-[calc(100%-2px)] h-[calc(100%-2px)] object-cover [filter:contrast(1.25)_saturate(1.3)_brightness(0.82)] transition-opacity duration-1000 ease-out ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span
                    className={`relative block font-serif font-black italic leading-none tracking-[-0.035em] text-[15vw] sm:text-[16vw] lg:text-[10.5vw] pt-[0.1em] pb-[0.26em] pl-[0.02em] ${
                      // Room above for č/í and below for j/p; inactive words are a soft solid tint (an outline
                      // stroke shows the variable font's overlapping contours as stray lines)
                      on ? "bg-white text-black mix-blend-screen" : "bg-paper text-forest/12 hover:text-forest/25"
                    }`}
                  >
                    {t.aboutVerbs[i]}
                  </span>
                  <span aria-hidden className={`absolute inset-0 bg-paper mix-blend-multiply pointer-events-none ${on ? "" : "hidden"}`} />
                  {/* Index on the right; the clip's progress runs along the rule beneath the word */}
                  <span
                    aria-hidden
                    className={`absolute right-0 top-1/2 -translate-y-1/2 font-serif italic text-2xl tabular-nums transition-colors duration-700 ${
                      on ? "text-forest" : "text-forest/20"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span aria-hidden data-progress={c} className="absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-forest" />
                </button>
              );
            })}
            {/* Phones: no mirror, the word carries the clip; the plate sits right under the words */}
            <div className="lg:hidden mt-6">{plate}</div>
          </div>
        </div>

        {/* Three facts that answer real questions: where, which days, until when */}
        <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          <div data-about-fade className="border-t border-ink/15 pt-5">
            <dt className="flex items-baseline gap-3">
              <span data-count={branches.length} className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">{branches.length}</span>
              <span className="text-ink-soft">{t.aboutFacts[0]}</span>
            </dt>
            <dd className="mt-4 flex flex-wrap gap-2">
              {branches.map((b) => (
                <a
                  key={b.id}
                  href="#pobocky"
                  onClick={goBranches}
                  className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm hover:border-forest hover:bg-forest hover:text-paper transition-colors"
                >
                  {b.city[lang]}
                </a>
              ))}
            </dd>
          </div>

          <div data-about-fade className="border-t border-ink/15 pt-5">
            <dt className="flex items-baseline gap-3">
              <span data-count={days} className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">{days}</span>
              <span className="text-ink-soft">{t.aboutFacts[1]}</span>
            </dt>
            <dd data-days className="mt-4 grid grid-cols-7 gap-1.5 max-w-xs">
              {t.aboutDays.map((d, i) => {
                const isToday = today === i;
                return (
                  <span key={d} data-day className="flex flex-col items-center gap-1.5">
                    <span className={`w-full h-1.5 rounded-full ${isToday ? "bg-moss" : "bg-forest/25"}`} />
                    <span className={`text-xs ${isToday ? "text-moss font-medium" : "text-ink-soft"}`}>{d}</span>
                  </span>
                );
              })}
            </dd>
          </div>

          <div data-about-fade className="border-t border-ink/15 pt-5">
            <dt className="flex items-baseline gap-3">
              <span className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">{close}</span>
              <span className="text-ink-soft">{t.aboutFacts[2]}</span>
            </dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
