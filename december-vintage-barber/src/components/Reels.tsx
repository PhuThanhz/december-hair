"use client";

import { useEffect, useRef, useState } from "react";
import { REELS, type Dict, type Lang } from "@/app/data";
import { gsap, useGSAP, ScrollTrigger, getLenis, EASE, MQ_DESKTOP, MQ_MOTION } from "@/lib/gsap";
import Magnetic from "./Magnetic";
import { playWhileVisible } from "@/lib/video";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Transformations": the salon's own clips in a cinema line-up. The clip in the
 * middle plays large and sharp; the others wait, smaller and turned away.
 * Scrolling moves the line along; clicking a side clip brings it to the front.
 */
export default function Reels({ t, lang, onBook }: { t: Dict; lang: Lang; onBook: (branchId: string) => void }) {
  const root = useRef<HTMLElement | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const reel = REELS[active];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ_DESKTOP, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-reel]");
        const shades = cards.map((c) => c.querySelector<HTMLElement>("[data-reel-shade]")!);
        const state = { p: 0 };
        let current = -1;

        const render = () => {
          const vw = window.innerWidth / 100;
          const n = cards.length;
          cards.forEach((card, i) => {
            // The line-up is a loop: there is always a clip on both sides of the one in front
            const d = gsap.utils.wrap(-n / 2, n / 2, i - state.p);
            const a = Math.min(Math.abs(d), 3);
            card.style.transform = `translate3d(-50%, -50%, 0) translate3d(${d * 23 * vw}px, 0, 0) rotateY(${gsap.utils.clamp(-38, 38, -d * 24)}deg) scale(${1 - a * 0.2})`;
            card.style.zIndex = String(100 - Math.round(a * 10));
            // Fully faded by the time a clip wraps to the other edge, so the jump is never seen
            const edge = gsap.utils.clamp(0, 1, (n / 2 - Math.abs(d)) * 2);
            card.style.opacity = String(gsap.utils.clamp(0, 1, 1.2 - a * 0.32) * edge);
            shades[i].style.opacity = String(Math.min(1, a) * 0.38);
          });
          const idx = Math.round(state.p);
          if (idx !== current) {
            current = idx;
            setActive(idx);
          }
        };

        const tween = gsap.to(state, {
          p: cards.length - 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${(cards.length - 1) * 75}%`,
            pin: true,
            anticipatePin: 1,
            scrub: 0.6, // Silky smooth fluid response without inertia stutter or lag
          },
        });
        trigger.current = tween.scrollTrigger ?? null;
        render();
        window.addEventListener("resize", render);
        return () => {
          window.removeEventListener("resize", render);
          trigger.current = null;
        };
      });

      mm.add(MQ_MOTION, () => {
        gsap.from("[data-reels-title] [data-line]", {
          yPercent: 110,
          duration: 1.3,
          ease: EASE,
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  // Nothing decodes while the section is off screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Only the clip in front carries the sound; only the front card plays (data-hold); more decoders at once made the scroll stutter
  useEffect(() => {
    if (!window.matchMedia(MQ_DESKTOP).matches) return;
    videos.current.forEach((v, i) => {
      if (v) v.muted = i === active ? muted : true;
    });
  }, [active, muted]);

  const goTo = (i: number) => {
    const st = trigger.current;
    if (!st) return;
    const y = st.start + (i / (REELS.length - 1)) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section ref={root} className="relative bg-forest text-paper overflow-hidden">
      {/* Desktop: cinema line-up */}
      <div className="hidden md:motion-safe:block relative h-[100svh]">
        <div className="absolute inset-x-0 top-0 pt-24 px-8 lg:px-12 flex items-start justify-between z-[200] pointer-events-none">
          <div>
            <h2 data-reels-title className="font-serif text-[6vw] leading-[1.1] tracking-[-0.02em] pr-10 overflow-visible">
              <span className="line-mask pr-10 overflow-visible">
                <span data-line className="block italic pr-8 overflow-visible">{t.reelsTitle}</span>
              </span>
            </h2>
          </div>
          <p className="label text-paper/60 tabular-nums pt-2">
            {pad(active + 1)} / {pad(REELS.length)}
          </p>
        </div>

        {/* Ambient lighting glow so the section does not feel dark or dull */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1100px] h-[80vh] bg-[radial-gradient(closest-side,rgb(63_107_44/0.28),transparent)] z-0" />

        <div className="absolute inset-0 [perspective:1400px] z-10">
          {REELS.map((r, i) => (
            <div
              key={r.id}
              data-reel
              onClick={() => {
                if (i === active) {
                  const nextMuted = !muted;
                  setMuted(nextMuted);
                  if (videos.current[i]) {
                    videos.current[i]!.muted = nextMuted;
                    videos.current[i]!.play().catch(() => {});
                  }
                } else {
                  goTo(i);
                }
              }}
              data-cursor={i === active ? (muted ? t.soundOn : t.soundOff) : r[lang === "cs" ? "tagCs" : "tagEn"]}
              className="group absolute left-1/2 top-[54%] h-[64svh] aspect-[9/16] rounded-[34px] sm:rounded-[42px] overflow-hidden border-[4px] sm:border-[6px] border-[#223a2b] ring-1 ring-paper/25 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.75)] bg-black cursor-pointer will-change-transform select-none transform-gpu [backface-visibility:hidden]"
            >
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                src={r.src}
                poster={r.poster}
                data-hold={i !== active || undefined}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black/90 rounded-full z-30 border border-white/10 flex items-center justify-center gap-1.5 pointer-events-none shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-black border border-white/25" />
                <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
              </div>

              {/* Live Reel Badge */}
              <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 text-[9px] text-paper font-mono border border-white/15 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>REEL</span>
              </div>

              {/* Sound & Action indicator */}
              <div className="absolute bottom-4 right-3.5 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 text-[10px] text-paper border border-white/15 shadow-md pointer-events-none">
                <span>{i === active ? (muted ? "🔇" : "🔊") : "▶"}</span>
                <span className="font-mono text-[9px]">
                  {i === active
                    ? muted
                      ? (lang === "cs" ? "Zvuk" : "Sound")
                      : (lang === "cs" ? "Hraje" : "Playing")
                    : (lang === "cs" ? "Přehrát" : "Play")}
                </span>
              </div>

              {/* Home indicator bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />

              {/* Subtle shade for non-active cards (no CSS transition fight, no heavy blur) */}
              <div data-reel-shade className="absolute inset-0 bg-black/40 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Caption of the clip in front */}
        <div className="absolute inset-x-0 bottom-0 px-8 lg:px-12 pb-8 flex items-end justify-between gap-8 z-[200]">
          <div key={reel.id} className="max-w-xl animate-[fadeIn_0.6s_ease-out]">
            <p className="label text-sage">{lang === "cs" ? reel.tagCs : reel.tagEn}</p>
            <p className="mt-2 font-serif italic text-3xl lg:text-4xl leading-tight">{lang === "cs" ? reel.cs : reel.en}</p>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <button
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                if (videos.current[active]) {
                  videos.current[active]!.muted = nextMuted;
                  videos.current[active]!.play().catch(() => {});
                }
              }}
              className="link-line cursor-pointer text-sm"
            >
              {muted ? t.soundOn : t.soundOff}
            </button>
            {reel.branch && (
              <Magnetic>
                <button
                  onClick={() => onBook(reel.branch!)}
                  className="cursor-pointer rounded-full bg-paper text-forest px-6 py-3 text-sm hover:bg-sage transition-colors duration-500"
                >
                  {t.filmBook} →
                </button>
              </Magnetic>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / reduced motion: swipeable reels */}
      <div className="md:motion-safe:hidden py-24">
        <div className="px-5 sm:px-8">
          <h2 className="font-serif italic text-[16vw] md:text-[8vw] leading-[0.95] pr-4">{t.reelsTitle}</h2>
        </div>
        <div className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-8 scroll-px-5 [scrollbar-width:none]">
          {REELS.map((r) => (
            <figure key={r.id} className="shrink-0 w-[70vw] md:w-[30vw] snap-start m-0">
              <div className="relative aspect-[9/16] rounded-3xl overflow-hidden border-4 border-[#223a2b] ring-1 ring-paper/20 shadow-xl bg-black">
                <video
                  src={r.src}
                  poster={r.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <figcaption className="mt-3">
                <span className="label text-sage">{lang === "cs" ? r.tagCs : r.tagEn}</span>
                <span className="block mt-1 font-serif italic text-xl">{lang === "cs" ? r.cs : r.en}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
