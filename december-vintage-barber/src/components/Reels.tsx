"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import type { Dict, Lang } from "@/content/types";
import { useContent } from "@/content/ContentProvider";
import { findBranch } from "@/content/helpers";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");
const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Proměny — Salon Video Carousel.
 * A luxury studio video carousel showcasing the signature salon reels.
 * Unpinned: vertical page scrolling remains 100% natural and fluid.
 * Flickity-style endless track: press-and-drag (mouse or touch) with momentum that settles onto the
 * nearest card, horizontal trackpad swipes, and prev/next arrows on both flanks that never hit an end.
 */
export default function Reels({
  t,
  lang,
  onBook,
}: {
  t: Dict;
  lang: Lang;
  onBook: (branchId: string) => void;
}) {
  const { reels, branches, settings } = useContent();
  // A reel about one salon books that salon; the others book the default one
  const home = findBranch(branches, settings.defaultBranch) ?? branches[0];
  const N = reels.length;
  // Two copies so the looping row always covers even very wide screens
  const slides = useMemo(() => [...reels, ...reels], [reels]);
  const root = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  // Track position (px, unbounded) and the card it is settling on (unbounded, wraps modulo N)
  const pos = useRef({ x: 0 });
  const step = useRef(1);
  const slot = useRef(0);
  const activeRef = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);

  // Drag state
  const drag = useRef({ down: false, moved: false, id: -1, startX: 0, startY: 0, originX: 0, lastX: 0, lastT: 0, v: 0 });

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Update muted state across videos
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) v.muted = i % N === active ? muted : true;
    });
  }, [active, muted, N]);

  const slotAt = (x: number) => Math.round(-x / step.current);

  // Wrap-around: each card is shifted by whole loops so the row never runs out on either side
  const render = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const s = step.current;
    const loop = s * slides.length;
    const lo = -2 * s;
    (Array.from(track.children) as HTMLElement[]).forEach((el, i) => {
      const base = i * s;
      const p = mod(base + pos.current.x - lo, loop) + lo;
      el.style.transform = `translate3d(${p - base}px,0,0)`;
    });
  }, [slides.length]);

  const markActive = useCallback(
    (j: number) => {
      const i = mod(j, N);
      if (i === activeRef.current) return;
      activeRef.current = i;
      setActive(i);
    },
    [N]
  );

  const goTo = useCallback(
    (j: number, duration = 0.85) => {
      slot.current = j;
      activeRef.current = mod(j, N);
      setActive(activeRef.current);
      tween.current?.kill();
      tween.current = gsap.to(pos.current, {
        x: -j * step.current,
        duration,
        ease: "expo.out",
        onUpdate: render,
      });
    },
    [render, N]
  );

  // Shortest way round to a given reel
  const goToReel = (idx: number) => {
    let delta = mod(idx - slot.current, N);
    if (delta > N / 2) delta -= N;
    goTo(slot.current + delta);
  };

  // Measure the card pitch (width + gap)
  useEffect(() => {
    const measure = () => {
      const cards = trackRef.current?.children;
      if (!cards || cards.length < 2) return;
      step.current = (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft || 1;
      pos.current.x = -slot.current * step.current;
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => {
      ro.disconnect();
      tween.current?.kill();
    };
  }, [render]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    tween.current?.kill();
    const d = drag.current;
    d.down = true;
    d.moved = false;
    d.id = e.pointerId;
    d.startX = d.lastX = e.clientX;
    d.startY = e.clientY;
    d.originX = pos.current.x;
    d.lastT = performance.now();
    d.v = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      // A mostly vertical touch gesture belongs to the page scroll
      if (Math.abs(e.clientY - d.startY) > Math.abs(dx)) {
        d.down = false;
        return;
      }
      d.moved = true;
      viewportRef.current?.setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.v = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.v;
    d.lastX = e.clientX;
    d.lastT = now;
    pos.current.x = d.originX + dx;
    render();
    markActive(slotAt(pos.current.x));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || e.pointerId !== d.id) return;
    d.down = false;
    if (!d.moved) return;
    // Stale velocity if the pointer rested before release
    const v = performance.now() - d.lastT > 80 ? 0 : d.v;
    let target = slotAt(pos.current.x + v * 280);
    // A quick flick always advances at least one card
    if (target === slotAt(d.originX) && Math.abs(v) > 0.35) target += v < 0 ? 1 : -1;
    goTo(target, 0.9);
  };

  // Horizontal trackpad swipes move the track, then settle on the nearest card
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let settle = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      tween.current?.kill();
      pos.current.x -= e.deltaX;
      render();
      markActive(slotAt(pos.current.x));
      clearTimeout(settle);
      settle = window.setTimeout(() => goTo(slotAt(pos.current.x), 0.7), 120);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      vp.removeEventListener("wheel", onWheel);
      clearTimeout(settle);
    };
  }, [goTo, render, markActive]);

  // Clicking a card brings that very copy to the anchor
  const focusCard = (el: HTMLElement) => {
    const first = trackRef.current?.children[0] as HTMLElement | undefined;
    const vp = viewportRef.current;
    if (!first || !vp) return;
    const anchor = vp.getBoundingClientRect().left + first.offsetLeft;
    goTo(slot.current + Math.round((el.getBoundingClientRect().left - anchor) / step.current));
  };

  if (!N) return null;

  return (
    <section ref={root} className="relative z-10 bg-[#08100a] text-paper overflow-hidden py-16 sm:py-24 lg:py-28 border-t border-paper/10">
      {/* Ambient Luxury Lighting (Pure subtle deep forest green, no yellow) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1200px] h-[650px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(63,107,44,0.15),transparent_70%)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Editorial Section Header (Clean, elegant, no yellow badge) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-paper/10">
          <div>
            <h2 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              {t.reelsTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-paper/70 font-serif italic max-w-lg">
              {t.reelsBody}
            </p>
          </div>

          {/* Counter Indicator */}
          <div className="self-start sm:self-end">
            <span className="label text-xs sm:text-sm text-paper/50 font-mono tracking-widest">
              {pad(active + 1)} / {pad(N)}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Studio Video Cards Track */}
      <div className="relative mt-8 sm:mt-12 select-none group/carousel">
        {/* Draggable viewport (Pristine 9:16 Cards with Generous Side Breathing Room) */}
        <div
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={t.reelsTitle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(e) => {
            // A drag that ends over a card or button must not count as a click
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goTo(slot.current + 1);
            else if (e.key === "ArrowLeft") goTo(slot.current - 1);
            else return;
            e.preventDefault();
          }}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y outline-none"
        >
          <div
            ref={trackRef}
            className="flex w-max gap-5 sm:gap-7 px-6 sm:px-12 lg:px-20 xl:px-28 2xl:px-36 py-4"
          >
          {slides.map((r, i) => {
            const isCurrent = i % N === active;
            const own = findBranch(branches, r.branch);
            const target = own ?? home;
            return (
              <div key={`${r.id}-${i}`} className="shrink-0 will-change-transform">
              <article
                onClick={(e) => {
                  focusCard(e.currentTarget);
                  if (videoRefs.current[i]) {
                    videoRefs.current[i]!.play().catch(() => {});
                  }
                }}
                className={`group relative w-[280px] sm:w-[320px] lg:w-[350px] aspect-[9/16] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-black border border-white/10 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] ${
                  isCurrent ? "ring-1 ring-white/70 scale-[1.01]" : "opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/40"
                }`}
              >
                {/* Video Player */}
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={r.video}
                  data-poster={r.poster}
                  muted={isCurrent ? muted : true}
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/35 pointer-events-none" />

                {/* Top Badge: Category & Counter */}
                <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between">
                  <span className="label text-[10px] font-mono px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-paper">
                    {r.tag[lang]}
                  </span>

                  {/* Sound Toggle Button on Card (Refined Minimalist SVG Icon) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      focusCard(e.currentTarget.closest("article")!);
                      const nextMuted = isCurrent ? !muted : false;
                      setMuted(nextMuted);
                      if (videoRefs.current[i]) {
                        videoRefs.current[i]!.muted = nextMuted;
                        videoRefs.current[i]!.play().catch(() => {});
                      }
                    }}
                    className="cursor-pointer w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-paper hover:bg-paper hover:text-forest transition-all shadow-md active:scale-90"
                    title={muted ? t.soundOn : t.soundOff}
                  >
                    {isCurrent && !muted ? (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.5-3.75v15l-4.5-3.75H2.25v-7.5h4.5Z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6-4.5 3.75H2.25v4.5h2.25l4.5 3.75V6Z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Bottom Card Captions & Direct Booking CTA */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end text-paper">
                  <p className="font-serif italic text-xl sm:text-2xl leading-snug drop-shadow-md">
                    {r.caption[lang]}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                    <span className="label text-[11px] text-paper/70 font-mono">
                      {own ? own.shortName : "December Hair"}
                    </span>

                    {target && (
                      <Magnetic>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBook(target.id);
                          }}
                          className="cursor-pointer whitespace-nowrap rounded-full bg-paper text-forest px-4 py-2 text-xs font-medium hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.35)] transition-all duration-300 active:scale-95"
                        >
                          {target.bookAt[lang]} →
                        </button>
                      </Magnetic>
                    )}
                  </div>
                </div>
              </article>
              </div>
            );
          })}
          </div>

          {/* Edge feathering so the flank arrows sit on calm ground */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-24 bg-gradient-to-r from-[#08100a] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-24 bg-gradient-to-l from-[#08100a] to-transparent z-10" />

          {/* Flank arrows (left: previous, right: next) */}
          {([
            { dir: -1, side: "left-3 sm:left-6 lg:left-10", label: t.prevVideo, d: "M15.75 19.5 8.25 12l7.5-7.5" },
            { dir: 1, side: "right-3 sm:right-6 lg:right-10", label: t.nextVideo, d: "m8.25 4.5 7.5 7.5-7.5 7.5" },
          ] as const).map((a) => (
            <div
              key={a.dir}
              className={`absolute top-1/2 -translate-y-1/2 z-20 hidden sm:block ${a.side}`}
            >
              <Magnetic strength={0.3}>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => goTo(slot.current + a.dir)}
                  aria-label={a.label}
                  className="cursor-pointer w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-md text-paper hover:bg-paper hover:text-[#08100a] hover:border-paper shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] transition-colors duration-300 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path strokeLinecap="round" strokeLinejoin="round" d={a.d} />
                  </svg>
                </button>
              </Magnetic>
            </div>
          ))}
        </div>

        {/* Progress rails */}
        <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-6">
          <span className="font-mono text-xs sm:text-sm text-paper/40 tracking-widest">
            {pad(active + 1)} <span className="text-paper/20">/</span> {pad(N)}
          </span>

          <div className="flex items-center gap-2">
            {reels.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToReel(idx)}
                className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === active ? "w-8 sm:w-10 bg-paper shadow-[0_0_10px_rgba(244,239,230,0.5)]" : "w-2 sm:w-2.5 bg-paper/20 hover:bg-paper/50"
                }`}
                aria-label={t.goToVideo.replace("{n}", String(idx + 1))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
