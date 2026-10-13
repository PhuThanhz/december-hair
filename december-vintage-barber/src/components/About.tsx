"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];
const CYCLE = 5000; // ms each clip plays before the next

// The doorway is drawn on a 520 × 680 grid so the D-shaped niche, the glass, its LED ring
// and the logo's hairline strands all line up at any size.
const GRID = { w: 520, h: 680 };
const box = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / GRID.w) * 100}%`,
  top: `${(y / GRID.h) * 100}%`,
  width: `${(w / GRID.w) * 100}%`,
  height: `${(h / GRID.h) * 100}%`,
});
// The December "D": a bold straight stem on the left and a bowl bulging out to the right.
// Every layer's bowl is a half-ellipse around the same centre, so the curves run parallel.
const D = { cx: 135, cy: 340, rx: 315, ry: 300 };
/** A D-shaped layer `inset` units inside the niche, starting at `left` (a thicker stem on the left). */
const dLayer = (left: number, inset: number) => {
  const rx = D.rx - inset;
  const ry = D.ry - inset;
  const w = D.cx + rx - left;
  return {
    ...box(left, D.cy - ry, w, ry * 2),
    borderRadius: `0 ${(rx / w) * 100}% ${(rx / w) * 100}% 0 / 0 50% 50% 0`,
  };
};
// Like the logo, the strands all leave the top of the stem and meet again at its foot, fanning out between.
const STRANDS = [1, 2, 3, 4, 5].map((k) => `M ${D.cx} ${D.cy - D.ry} A ${D.rx + k * 13} ${D.ry} 0 0 1 ${D.cx} ${D.cy + D.ry}`);

/**
 * "Three salons, one team", seen through a doorway shaped like the December "D". Scrolling in
 * switches its LED halo on and draws the logo's hairline strands around the bowl; the clip
 * in the glass is the verb lit underneath (cut, colour, care).
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
          // The logo's strands draw themselves around the bowl
          .fromTo("[data-strand]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.08 }, 0.9)
          .fromTo("[data-verbs]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.1)
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

        {/* The D doorway */}
        <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-5">
          <div data-mirror-wrap className="relative mx-auto w-full max-w-[460px]" style={{ aspectRatio: `${GRID.w} / ${GRID.h}` }}>
            <svg viewBox={`0 0 ${GRID.w} ${GRID.h}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
              {STRANDS.map((d, i) => (
                <path
                  key={d}
                  data-strand
                  d={d}
                  pathLength={1}
                  strokeDasharray={1}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  className="text-forest"
                  style={{ opacity: 0.55 - i * 0.09 }}
                />
              ))}
            </svg>
            <div data-niche className="absolute bg-forest" style={dLayer(30, 0)} />
            <div
              data-led
              aria-hidden
              className="absolute border-2 border-[#fffaf0]/90 shadow-[0_0_8px_1px_rgba(255,246,222,0.8),0_0_22px_2px_rgba(255,246,222,0.28),inset_0_0_10px_1px_rgba(255,246,222,0.5)]"
              style={dLayer(88, 17)}
            />
            <div data-glass className="absolute overflow-hidden bg-forest-2" style={dLayer(95, 24)}>
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
          </div>

          {/* The lit verb is the clip in the glass */}
          <div data-verbs className="mt-6 flex items-baseline justify-center gap-3 font-serif italic text-2xl sm:text-[1.7rem]">
            {CLIPS.map((c, i) => (
              <span key={c} className="flex items-baseline gap-3">
                {i > 0 && <span className="text-ink/25">·</span>}
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={c === active}
                  className={`cursor-pointer transition-colors duration-500 ${c === active ? "text-moss" : "text-ink/35 hover:text-ink"}`}
                >
                  {t.aboutVerbs[i]}
                </button>
              </span>
            ))}
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
