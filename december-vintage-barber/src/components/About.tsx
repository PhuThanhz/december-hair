"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, ScrollTrigger, EASE, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];

/**
 * "Three salons, one team", then the three things we do as huge words. The word in focus
 * comes alive: its clip plays inside the letters (hair, colour, water, never a cropped face),
 * while the other two wait as outlines. Scrolling, hovering or tapping a word brings it to life.
 *
 * Video-in-text without masks: inside an isolated box, white paper with black letters is
 * "screen"-blended over the clip (black letters let the clip through, white stays white),
 * then a paper-coloured layer is "multiply"-blended so the white matches the page.
 * Works the same in Chrome and Safari.
 */
export default function About({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");

  // Only the living word's clip plays, and only while it is on screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

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
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-paper px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-x-8 gap-y-6 items-end">
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

        {/* The three things we do; the one in focus has its clip running through the letters */}
        <div className="mt-14 sm:mt-20 border-t border-ink/15">
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
                  className={`absolute inset-0 w-full h-full object-cover [filter:contrast(1.25)_saturate(1.3)_brightness(0.82)] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}
                />
                <span
                  className={`relative block font-serif font-extrabold italic leading-[0.92] tracking-[-0.035em] text-[19vw] sm:text-[17vw] lg:text-[15.5vw] pb-[0.06em] pl-[0.02em] transition-colors duration-500 ${
                    on ? "bg-white text-black mix-blend-screen" : "bg-paper text-outline [--stroke:rgba(15,26,18,0.28)]"
                  }`}
                >
                  {t.aboutVerbs[i]}
                </span>
                {/* Turns the white around the letters back into the page colour */}
                <span aria-hidden className={`absolute inset-0 bg-paper mix-blend-multiply pointer-events-none ${on ? "" : "hidden"}`} />
              </button>
            );
          })}
        </div>

        {/* The facts a visitor actually needs */}
        <dl className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl">
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
