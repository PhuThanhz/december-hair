"use client";

import { useEffect, useRef, useState } from "react";
import { BRANCHES, type Dict } from "@/app/data";
import { gsap, useGSAP, ScrollTrigger, EASE, MQ_MOTION } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];

// Latest closing time across the salons, e.g. "09:00 – 20:00" → 20:00
const CLOSE = BRANCHES.map((b) => b.hours.split(/\s*[–-]\s*/)[1]).sort().reverse()[0];

/** Today's weekday in Prague (0 = Monday), whatever the visitor's own timezone. */
const pragueDay = () =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Prague", weekday: "short" }).format(new Date())
  );

/**
 * "Three salons, one team", then the three things we do as huge words. The word crossing the
 * middle of the screen comes alive: its clip runs through the letters and plays, sharp, in the
 * frame beside them. Below, three facts: where, which days, until when.
 *
 * Video-in-text without masks: inside an isolated box, white paper with black letters is
 * "screen"-blended over the clip (black letters let it through, white stays white), then a
 * paper-coloured layer is "multiply"-blended so the white matches the page.
 */
export default function About({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");
  // Clock-dependent, so only known on the client
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  useEffect(() => {
    const tick = () => setToday(pragueDay());
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
          start: "top 60%",
          end: "bottom 40%",
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
          {/* The clip, sharp and in full, beside the words it lives in */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <div className="lg:sticky lg:top-24">
              <div className="relative aspect-[16/11] lg:aspect-[4/5] overflow-hidden rounded-[2px] bg-bone">
                {CLIPS.map((c) => (
                  <video
                    key={c}
                    src={`/videos/about-${c}.mp4`}
                    poster={`/videos/about-${c}.jpg`}
                    data-hold={c !== active || undefined}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={t.aboutClips[c]}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${c === active ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
              </div>
              <p className="mt-3 flex justify-between text-sm text-ink-soft">
                <span className="text-ink">{t.aboutClips[active]}</span>
                <span className="tabular-nums">{CLIPS.indexOf(active) + 1} / 3</span>
              </p>
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
                  onMouseEnter={() => setActive(c)}
                  aria-pressed={on}
                  aria-label={t.aboutClips[c]}
                  className="relative isolate block w-full cursor-pointer overflow-hidden border-b border-ink/15 text-left"
                >
                  <video
                    src={`/videos/about-${c}.mp4`}
                    poster={`/videos/about-${c}.jpg`}
                    data-hold={!on || undefined}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden
                    className={`absolute inset-0 w-full h-full object-cover [filter:contrast(1.25)_saturate(1.3)_brightness(0.82)] transition-opacity duration-500 ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span
                    className={`relative block font-serif font-black italic leading-none tracking-[-0.035em] text-[19vw] sm:text-[16vw] lg:text-[10.5vw] pt-[0.1em] pb-[0.26em] pl-[0.02em] ${
                      // Room above for č/í and below for j/p; inactive words are a soft solid tint (an outline
                      // stroke shows the variable font's overlapping contours as stray lines)
                      on ? "bg-white text-black mix-blend-screen" : "bg-paper text-forest/12 hover:text-forest/25"
                    }`}
                  >
                    {t.aboutVerbs[i]}
                  </span>
                  <span aria-hidden className={`absolute inset-0 bg-paper mix-blend-multiply pointer-events-none ${on ? "" : "hidden"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Three facts that answer real questions: where, which days, until when */}
        <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          <div data-about-fade className="border-t border-ink/15 pt-5">
            <dt className="flex items-baseline gap-3">
              <span data-count="3" className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">3</span>
              <span className="text-ink-soft">{t.aboutFacts[0].l}</span>
            </dt>
            <dd className="mt-4 flex flex-wrap gap-2">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href="#pobocky"
                  onClick={goBranches}
                  className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm hover:border-forest hover:bg-forest hover:text-paper transition-colors"
                >
                  {b.city}
                </a>
              ))}
            </dd>
          </div>

          <div data-about-fade className="border-t border-ink/15 pt-5">
            <dt className="flex items-baseline gap-3">
              <span data-count="7" className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">7</span>
              <span className="text-ink-soft">{t.aboutFacts[1].l}</span>
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
              <span className="font-serif [font-variant-numeric:lining-nums] text-6xl leading-none text-forest">{CLOSE}</span>
              <span className="text-ink-soft">{t.aboutFacts[2].l}</span>
            </dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
