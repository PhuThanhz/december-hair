"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

const CLIPS = ["cut", "colour", "care"] as const;
type Clip = (typeof CLIPS)[number];
const CYCLE = 4200; // ms each verb stays lit

/**
 * One large statement. Its three verbs (cut, colour, care) are live: the lit
 * one plays its clip in the frame beside the text, cycling on its own, and
 * hovering a verb shows that clip straight away.
 */
export default function About({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<Clip>("cut");
  const [paused, setPaused] = useState(false);

  // Only the visible clip plays, and only while the section is on screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Auto-cycle the verbs unless the visitor is pointing at one
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => {
      setActive((a) => CLIPS[(CLIPS.indexOf(a) + 1) % CLIPS.length]);
    }, CYCLE);
    return () => window.clearTimeout(id);
  }, [active, paused]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%" } });
        tl.from("[data-word]", { autoAlpha: 0, filter: "blur(10px)", duration: 1.1, ease: "power2.out", stagger: 0.05 })
          .from("[data-about-frame]", { autoAlpha: 0, scale: 0.94, duration: 1.6, ease: "power3.out" }, 0.2)
          .from("[data-about-note]", { autoAlpha: 0, duration: 1 }, 1);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // "… [cut|Stříháme], [colour|barvíme] …" → plain words and live verbs
  const parts = t.aboutRich.split(/(\[\w+\|[^\]]+\])/).filter(Boolean);

  return (
    <section ref={root} className="relative bg-paper px-5 sm:px-8 lg:px-12 py-28 sm:py-36">
      <div className="mx-auto max-w-[1600px] grid grid-cols-12 gap-x-8 gap-y-14 items-center">
        <div className="col-span-12 lg:col-span-7">
          <p className="font-serif text-[11vw] sm:text-[7.5vw] lg:text-[4.9vw] leading-[1.06] tracking-[-0.025em]">
            {parts.map((part, i) => {
              const m = part.match(/^\[(\w+)\|([^\]]+)\]$/);
              if (m) {
                const key = m[1] as Clip;
                const on = key === active;
                return (
                  <span
                    key={i}
                    data-word
                    onMouseEnter={() => {
                      setActive(key);
                      setPaused(true);
                    }}
                    onMouseLeave={() => setPaused(false)}
                    className={`relative inline-block cursor-default italic transition-colors duration-500 ${on ? "text-moss" : "text-ink"}`}
                  >
                    {m[2]}
                    {/* Underline doubles as the timer for the lit verb */}
                    <span className="absolute left-0 right-0 -bottom-[0.04em] h-[2px] bg-ink/10 overflow-hidden">
                      <span
                        key={on ? `${active}-${paused}` : "off"}
                        className="block h-full bg-moss origin-left"
                        style={{
                          transform: on ? undefined : "scaleX(0)",
                          animation: on && !paused ? `aboutTimer ${CYCLE}ms linear forwards` : undefined,
                        }}
                      />
                    </span>
                  </span>
                );
              }
              return part.split(/(\s+)/).map((w, j) =>
                w.trim() ? (
                  <span key={`${i}-${j}`} data-word className="inline-block">
                    {w}
                  </span>
                ) : (
                  w
                )
              );
            })}
          </p>
          <p data-about-note className="mt-10 text-lg text-ink-soft max-w-md">
            {t.aboutNote}
          </p>
        </div>

        {/* The clip for the lit verb */}
        <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
          <div data-about-frame className="relative aspect-[4/5] overflow-hidden bg-bone rounded-3xl shadow-xl border border-forest/10">
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
                className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-quint)] ${
                  c === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]"
                }`}
              />
            ))}
            <div className="absolute left-0 right-0 bottom-0 p-5 flex items-end justify-between text-paper bg-gradient-to-t from-forest/80 to-transparent">
              <span className="font-serif italic text-3xl drop-shadow-sm">{t.aboutClips[active]}</span>
              <span className="label tabular-nums">0{CLIPS.indexOf(active) + 1} / 03</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
