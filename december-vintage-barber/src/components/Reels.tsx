"use client";

import { useEffect, useRef, useState } from "react";
import { REELS, type Dict, type Lang } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_DESKTOP, MQ_MOTION } from "@/lib/gsap";
import Magnetic from "./Magnetic";
import { playWhileVisible } from "@/lib/video";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Transformations": unpinned 3D interactive carousel.
 * The visitor can scroll freely through the page vertically without being trapped.
 * To interact with reels, they can drag/swipe horizontally, click next/prev arrows,
 * or click on any card to bring it front and center.
 */
export default function Reels({ t, lang, onBook }: { t: Dict; lang: Lang; onBook: (branchId: string) => void }) {
  const root = useRef<HTMLElement | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const reel = REELS[active];

  const stateRef = useRef({ p: 0 });
  const renderRef = useRef<() => void>(() => {});
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startP = useRef(0);
  const hasMoved = useRef(false);

  const goTo = (i: number) => {
    const targetIdx = gsap.utils.clamp(0, REELS.length - 1, i);
    gsap.killTweensOf(stateRef.current);
    gsap.to(stateRef.current, {
      p: targetIdx,
      duration: 0.55,
      ease: "power2.out",
      onUpdate: () => renderRef.current(),
      onComplete: () => {
        setActive(targetIdx);
      },
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.clientX;
    startP.current = stateRef.current.p;
    gsap.killTweensOf(stateRef.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) hasMoved.current = true;
    const vw = window.innerWidth;
    const delta = -dx / (vw * 0.22);
    stateRef.current.p = gsap.utils.clamp(-0.25, REELS.length - 0.75, startP.current + delta);
    renderRef.current();
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (hasMoved.current) {
      const nearest = Math.round(stateRef.current.p);
      goTo(nearest);
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ_DESKTOP, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-reel]");
        const shades = cards.map((c) => c.querySelector<HTMLElement>("[data-reel-shade]")!);
        let current = -1;

        const render = () => {
          const vw = window.innerWidth / 100;
          const n = cards.length;
          cards.forEach((card, i) => {
            const d = gsap.utils.wrap(-n / 2, n / 2, i - stateRef.current.p);
            const a = Math.min(Math.abs(d), 3);
            card.style.transform = `translate3d(-50%, -50%, 0) translate3d(${d * 23 * vw}px, 0, 0) rotateY(${gsap.utils.clamp(-38, 38, -d * 24)}deg) scale(${1 - a * 0.2})`;
            card.style.zIndex = String(100 - Math.round(a * 10));
            const edge = gsap.utils.clamp(0, 1, (n / 2 - Math.abs(d)) * 2);
            card.style.opacity = String(gsap.utils.clamp(0, 1, 1.2 - a * 0.32) * edge);
            shades[i].style.opacity = String(Math.min(1, a) * 0.38);
          });
          const idx = Math.round(stateRef.current.p);
          if (idx !== current) {
            current = idx;
            setActive(idx);
          }
        };

        renderRef.current = render;
        render();
        window.addEventListener("resize", render);
        return () => {
          window.removeEventListener("resize", render);
        };
      });

      mm.add(MQ_MOTION, () => {
        gsap.from("[data-reels-title] [data-line]", {
          yPercent: 110,
          duration: 1.3,
          ease: EASE,
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  // Nothing decodes while the section is off screen
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Only the clip in front carries the sound; only the front card plays
  useEffect(() => {
    if (!window.matchMedia(MQ_DESKTOP).matches) return;
    videos.current.forEach((v, i) => {
      if (v) v.muted = i === active ? muted : true;
    });
  }, [active, muted]);

  return (
    <section ref={root} className="relative bg-forest text-paper overflow-hidden py-16 lg:py-20 border-t border-paper/10">
      {/* Desktop: unpinned 3D interactive line-up */}
      <div className="hidden md:motion-safe:block relative h-[88svh] min-h-[660px] max-h-[860px]">
        <div className="absolute inset-x-0 top-0 pt-6 px-8 lg:px-12 flex items-start justify-between z-[200] pointer-events-none">
          <div>
            <h2 data-reels-title className="font-serif text-[5.5vw] leading-[1.05] tracking-[-0.02em] pr-10 overflow-visible">
              <span className="line-mask pr-10 overflow-visible">
                <span data-line className="block italic pr-8 overflow-visible">{t.reelsTitle}</span>
              </span>
            </h2>
          </div>

          {/* Quick controls: Hint, Prev/Next, counter */}
          <div className="pointer-events-auto flex items-center gap-4 pt-2">
            <span className="hidden lg:inline-block label text-[10px] text-paper/40 font-mono tracking-wider">
              {lang === "cs" ? "← Tažením procházejte →" : "← Drag to explore →"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                className="cursor-pointer w-9 h-9 rounded-full border border-paper/20 flex items-center justify-center text-sm text-paper/70 hover:text-paper hover:border-paper/60 hover:bg-paper/10 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-xs"
                aria-label="Předchozí video"
              >
                ←
              </button>
              <button
                onClick={() => goTo(active + 1)}
                disabled={active === REELS.length - 1}
                className="cursor-pointer w-9 h-9 rounded-full border border-paper/20 flex items-center justify-center text-sm text-paper/70 hover:text-paper hover:border-paper/60 hover:bg-paper/10 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-xs"
                aria-label="Další video"
              >
                →
              </button>
            </div>

            <p className="label text-paper/60 tabular-nums text-xs">
              {pad(active + 1)} / {pad(REELS.length)}
            </p>
          </div>
        </div>

        {/* Ambient lighting glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1100px] h-[80vh] bg-[radial-gradient(closest-side,rgb(63_107_44/0.28),transparent)] z-0" />

        {/* 3D Track with horizontal drag and touch gestures */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 [perspective:1400px] z-10 cursor-grab active:cursor-grabbing touch-pan-y select-none"
        >
          {REELS.map((r, i) => (
            <div
              key={r.id}
              data-reel
              onClick={() => {
                if (hasMoved.current) return;
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
              className="group absolute left-1/2 top-[53%] h-[62svh] aspect-[9/16] rounded-[34px] sm:rounded-[42px] overflow-hidden border-[4px] sm:border-[6px] border-[#223a2b] ring-1 ring-paper/25 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)] bg-black cursor-pointer will-change-transform select-none transform-gpu [backface-visibility:hidden]"
            >
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                src={r.src}
                data-poster={r.poster}
                data-hold={i !== active || undefined}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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

              {/* Subtle shade for non-active cards */}
              <div data-reel-shade className="absolute inset-0 bg-black/40 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Caption of the clip in front */}
        <div className="absolute inset-x-0 bottom-0 px-8 lg:px-12 pb-6 flex items-end justify-between gap-8 z-[200] pointer-events-none">
          <div key={reel.id} className="max-w-xl animate-[fadeIn_0.6s_ease-out] pointer-events-auto">
            <p className="label text-sage">{lang === "cs" ? reel.tagCs : reel.tagEn}</p>
            <p className="mt-2 font-serif italic text-3xl lg:text-4xl leading-tight">{lang === "cs" ? reel.cs : reel.en}</p>
          </div>
          <div className="flex items-center gap-5 shrink-0 pointer-events-auto">
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
                  className="cursor-pointer rounded-full bg-paper text-forest px-6 py-3 text-sm hover:bg-sage transition-colors duration-500 shadow-sm"
                >
                  {t.filmBook} →
                </button>
              </Magnetic>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / reduced motion: swipeable reels */}
      <div className="md:motion-safe:hidden py-16">
        <div className="px-5 sm:px-8">
          <h2 className="font-serif italic text-[16vw] md:text-[8vw] leading-[0.95] pr-4">{t.reelsTitle}</h2>
        </div>
        <div className="mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-8 scroll-px-5 [scrollbar-width:none]">
          {REELS.map((r) => (
            <figure key={r.id} className="shrink-0 w-[70vw] md:w-[30vw] snap-start m-0">
              <div className="relative aspect-[9/16] rounded-3xl overflow-hidden border-4 border-[#223a2b] ring-1 ring-paper/20 shadow-xl bg-black">
                <video
                  src={r.src}
                  data-poster={r.poster}
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
