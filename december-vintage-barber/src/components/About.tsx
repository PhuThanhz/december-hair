"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];
const CYCLE = 5000; // ms each clip plays before the next

// The mirror is drawn on a 520 × 700 grid so the arched niche, the glass, its LED ring
// and the curved words above it all line up at any size.
const GRID = { w: 520, h: 700 };
const box = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / GRID.w) * 100}%`,
  top: `${(y / GRID.h) * 100}%`,
  width: `${(w / GRID.w) * 100}%`,
  height: `${(h / GRID.h) * 100}%`,
});
const ARCH = "9999px 9999px 0 0"; // round top, square bottom
// Arch centre (260, 280): niche radius 220, words ride 32 units outside it
const WORD_PATH = "M 8 280 A 252 252 0 0 1 512 280";

/**
 * "Three salons, one team", told through the salon's own signature: an arched mirror with
 * an LED halo, set in a green niche. Scrolling in switches the mirror on; the three verbs
 * curve along the arch and the lit one is the clip playing in the glass.
 */
export default function About({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");

  // Only the visible clip plays, and only while the section is on screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Advance to the next clip; picking a verb restarts the timer
  useEffect(() => {
    const id = window.setTimeout(() => setActive((a) => CLIPS[(CLIPS.indexOf(a) + 1) % CLIPS.length]), CYCLE);
    return () => window.clearTimeout(id);
  }, [active]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-mirror-wrap]", start: "top 75%" } });
        tl.fromTo("[data-niche]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.out" })
          .fromTo("[data-glass]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, 0.45)
          // The LED halo flickers on like a mirror light being switched on
          .fromTo(
            "[data-led]",
            { autoAlpha: 0 },
            { keyframes: [{ autoAlpha: 0.7, duration: 0.08 }, { autoAlpha: 0.15, duration: 0.1 }, { autoAlpha: 1, duration: 0.5 }] },
            0.8
          )
          .fromTo("[data-arc]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1)
          .fromTo("[data-about-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, 0.2)
          .fromTo("[data-about-fade]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.5);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-paper px-5 sm:px-8 lg:px-12 py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-x-8 gap-y-12 items-center">
        <div className="col-span-12 lg:col-span-4">
          <h2 className="font-serif text-6xl sm:text-7xl lg:text-[5rem] leading-[0.98] tracking-[-0.03em]">
            {t.aboutTitle.map((line, i) => (
              <span key={i} className="line-mask">
                <span data-about-line className={`block ${i === 1 ? "italic text-moss" : ""}`}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p data-about-fade className="mt-7 max-w-sm text-lg leading-relaxed text-ink-soft">
            {t.aboutText}
          </p>
        </div>

        {/* The mirror */}
        <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-5">
          <div data-mirror-wrap className="relative mx-auto w-full max-w-[460px]" style={{ aspectRatio: `${GRID.w} / ${GRID.h}` }}>
            <div data-niche className="absolute bg-forest" style={{ ...box(40, 60, 440, 630), borderRadius: ARCH }} />
            <div
              data-led
              aria-hidden
              className="absolute border-2 border-[#fffaf0]/90 shadow-[0_0_8px_1px_rgba(255,246,222,0.8),0_0_22px_2px_rgba(255,246,222,0.28),inset_0_0_10px_1px_rgba(255,246,222,0.5)]"
              style={{ ...box(57, 77, 406, 596), borderRadius: ARCH }}
            />
            <div data-glass className="absolute overflow-hidden bg-forest-2" style={{ ...box(64, 84, 392, 582), borderRadius: ARCH }}>
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

            {/* The verbs ride the curve of the arch; the lit one is playing */}
            <svg data-arc viewBox={`0 0 ${GRID.w} ${GRID.h}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                <path id="about-arch" d={WORD_PATH} />
              </defs>
              <text className="font-serif italic" fontSize="25" letterSpacing="1">
                <textPath href="#about-arch" startOffset="50%" textAnchor="middle">
                  {CLIPS.map((c, i) => (
                    <tspan key={c}>
                      {i > 0 && <tspan className="fill-ink/25">{"  ·  "}</tspan>}
                      <tspan
                        role="button"
                        tabIndex={0}
                        aria-pressed={c === active}
                        onClick={() => setActive(c)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(c)}
                        className={`pointer-events-auto cursor-pointer outline-none transition-[fill] duration-500 ${
                          c === active ? "fill-moss" : "fill-ink/35 hover:fill-ink"
                        }`}
                      >
                        {t.aboutVerbs[i]}
                      </tspan>
                    </tspan>
                  ))}
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        {/* The facts a visitor actually needs */}
        <dl className="col-span-12 lg:col-span-3 lg:col-start-10 grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-8">
          {t.aboutFacts.map((f) => (
            <div key={f.n} data-about-fade className="border-t border-ink/15 pt-4">
              <dt className="font-serif [font-variant-numeric:lining-nums] text-[2.4rem] sm:text-6xl leading-none tracking-[-0.02em] text-forest">{f.n}</dt>
              <dd className="mt-3 text-sm leading-snug text-ink-soft">{f.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
