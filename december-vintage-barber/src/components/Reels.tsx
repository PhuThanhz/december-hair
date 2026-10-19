"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import type { Dict, Lang } from "@/content/types";
import { useContent } from "@/content/ContentProvider";
import { findBranch } from "@/content/helpers";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Proměny — Salon Video Carousel.
 * A luxury studio video carousel showcasing the 6 signature salon reels.
 * Unpinned: vertical page scrolling remains 100% natural and fluid.
 * - Laptop: horizontal carousel with drag, smooth arrow navigation, and sound toggle.
 * - Mobile: touch-swipeable cards with snap scrolling and clear booking CTA.
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
  const root = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  // Drag-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Update muted state across videos
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) v.muted = i === active ? muted : true;
    });
  }, [active, muted]);

  const scrollBy = (offset: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.35;
    if (Math.abs(walk) > 6) hasMoved.current = true;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Track active item when scrolling naturally
  const onScroll = useCallback(() => {
    if (!trackRef.current) return;
    const scrollPos = trackRef.current.scrollLeft;
    const cardWidth = trackRef.current.firstElementChild?.clientWidth || 320;
    const newIdx = Math.round(scrollPos / (cardWidth + 20));
    setActive(Math.max(0, Math.min(reels.length - 1, newIdx)));
  }, [reels.length]);

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
              {pad(active + 1)} / {pad(reels.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Studio Video Cards Track */}
      <div className="relative mt-8 sm:mt-12 select-none group/carousel">
        {/* Scrollable Track (Zero Obstruction, Pristine 9:16 Cards with Generous Side Breathing Room) */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onScroll={onScroll}
          className="flex gap-5 sm:gap-7 px-6 sm:px-12 lg:px-20 xl:px-28 2xl:px-36 scroll-pl-6 sm:scroll-pl-12 lg:scroll-pl-20 xl:scroll-pl-28 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab active:cursor-grabbing snap-x snap-mandatory py-4 touch-pan-x"
        >
          {reels.map((r, i) => {
            const isCurrent = i === active;
            const own = findBranch(branches, r.branch);
            const target = own ?? home;
            return (
              <article
                key={r.id}
                onClick={() => {
                  if (hasMoved.current) return;
                  setActive(i);
                  if (videoRefs.current[i]) {
                    videoRefs.current[i]!.play().catch(() => {});
                  }
                }}
                className={`group relative shrink-0 snap-start w-[280px] sm:w-[320px] lg:w-[350px] aspect-[9/16] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-black border border-white/10 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] ${
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
                  muted={i === active ? muted : true}
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
                      setActive(i);
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
            );
          })}
        </div>

        {/* Editorial Bottom Navigation Dock (Left: Prev, Center: Progress, Right: Next) */}
        <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 mt-8 sm:mt-10 flex items-center justify-between gap-4">
          {/* Left: Previous Button */}
          <Magnetic strength={0.3}>
            <button
              onClick={() => scrollBy(-380)}
              className="group cursor-pointer flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 hover:border-paper bg-white/[0.04] hover:bg-paper text-paper hover:text-[#08100a] backdrop-blur-md transition-all duration-300 shadow-sm active:scale-95"
              aria-label={t.prevVideo}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6-6m-6 6l6 6" />
              </svg>
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest font-medium">
                {t.prev}
              </span>
            </button>
          </Magnetic>

          {/* Center: Slide Counter & Minimalist Dash Rails */}
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-mono text-xs sm:text-sm text-paper/40 tracking-widest">
              {pad(active + 1)} <span className="text-paper/20">/</span> {pad(reels.length)}
            </span>

            <div className="hidden sm:flex items-center gap-2">
              {reels.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActive(idx);
                    if (trackRef.current) {
                      const cardWidth = trackRef.current.firstElementChild?.clientWidth || 320;
                      trackRef.current.scrollTo({ left: idx * (cardWidth + 20), behavior: "smooth" });
                    }
                  }}
                  className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === active ? "w-8 sm:w-10 bg-paper shadow-[0_0_10px_rgba(244,239,230,0.5)]" : "w-2 sm:w-2.5 bg-paper/20 hover:bg-paper/50"
                  }`}
                  aria-label={t.goToVideo.replace("{n}", String(idx + 1))}
                />
              ))}
            </div>
          </div>

          {/* Right: Next Button */}
          <Magnetic strength={0.3}>
            <button
              onClick={() => scrollBy(380)}
              className="group cursor-pointer flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 hover:border-paper bg-white/[0.04] hover:bg-paper text-paper hover:text-[#08100a] backdrop-blur-md transition-all duration-300 shadow-sm active:scale-95"
              aria-label={t.nextVideo}
            >
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest font-medium">
                {t.next}
              </span>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6-6m6 6l-6 6" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
