"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];
const CYCLE = 5000; // ms each clip plays before the next

/**
 * Who we are in one line, three facts that matter (how many salons, open every day,
 * how late), and a short film of the work. The clips advance like stories; the
 * tabs under the frame show progress and jump straight to a clip.
 */
export default function About({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");

  // Only the visible clip plays, and only while the section is on screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Advance to the next clip; restarting the timer whenever the visitor picks one
  useEffect(() => {
    const id = window.setTimeout(() => setActive((a) => CLIPS[(CLIPS.indexOf(a) + 1) % CLIPS.length]), CYCLE);
    return () => window.clearTimeout(id);
  }, [active]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%" } });
        tl.fromTo("[data-about-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.1 })
          .fromTo("[data-about-fade]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.3)
          .fromTo("[data-about-frame]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" }, 0.15);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-paper px-5 sm:px-8 lg:px-12 py-28 sm:py-36">
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-x-8 gap-y-16 items-center">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="font-serif text-6xl sm:text-7xl lg:text-[5.5rem] leading-[0.98] tracking-[-0.03em]">
            {t.aboutTitle.map((line, i) => (
              <span key={i} className="line-mask">
                <span data-about-line className={`block ${i === 1 ? "italic text-moss" : ""}`}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <p data-about-fade className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
            {t.aboutText}
          </p>

          {/* The facts a visitor actually needs */}
          <dl className="mt-14 grid grid-cols-3 gap-4 sm:gap-6 border-t border-ink/15 pt-8 max-w-xl">
            {t.aboutFacts.map((f) => (
              <div key={f.n} data-about-fade>
                <dt className="font-serif [font-variant-numeric:lining-nums] text-[2.4rem] sm:text-6xl leading-none tracking-[-0.02em] text-forest">{f.n}</dt>
                <dd className="mt-3 text-sm leading-snug text-ink-soft">{f.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The work, as short stories */}
        <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-9">
          <div data-about-frame className="relative aspect-[4/5] overflow-hidden bg-bone rounded-[2px]">
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
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  c === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <div data-about-fade className="mt-4 grid grid-cols-3 gap-3" role="tablist">
            {CLIPS.map((c) => {
              const on = c === active;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(c)}
                  className="group cursor-pointer text-left"
                >
                  <span className="block h-[2px] bg-ink/12 overflow-hidden">
                    <span
                      key={on ? active : "off"}
                      className="block h-full bg-moss origin-left"
                      style={{ transform: on ? undefined : "scaleX(0)", animation: on ? `aboutTimer ${CYCLE}ms linear forwards` : undefined }}
                    />
                  </span>
                  <span className={`mt-2 block text-sm transition-colors ${on ? "text-ink" : "text-ink-soft group-hover:text-ink"}`}>
                    {t.aboutClips[c]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
