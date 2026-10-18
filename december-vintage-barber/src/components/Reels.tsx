"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { REELS, type Dict, type Lang } from "@/app/data";
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
    setActive(Math.max(0, Math.min(REELS.length - 1, newIdx)));
  }, []);

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
              {lang === "cs"
                ? "Nahlédněte do atmosféry našich salonů v Praze, Kladně a Mladé Boleslavi."
                : "Experience the unique atmosphere of our salons in Prague, Kladno and Mladá Boleslav."}
            </p>
          </div>

          {/* Counter Indicator */}
          <div className="self-start sm:self-end">
            <span className="label text-xs sm:text-sm text-paper/50 font-mono tracking-widest">
              {pad(active + 1)} / {pad(REELS.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Studio Video Cards Track with High-End Editorial Controls */}
      <div className="relative mt-8 sm:mt-12 select-none group/carousel">
        {/* Cinematic Soft Edge Vignettes */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#08100a] via-[#08100a]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#08100a] via-[#08100a]/80 to-transparent z-20" />

        {/* Left Floating Magnetic Button */}
        <div className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
          <Magnetic strength={0.4}>
            <button
              onClick={() => scrollBy(-380)}
              className="group cursor-pointer relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-paper/10 hover:bg-paper text-paper hover:text-forest backdrop-blur-2xl border border-white/20 hover:border-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-400 hover:scale-105 active:scale-95"
              aria-label="Předchozí video"
            >
              <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-x-1 relative z-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
          </Magnetic>
        </div>

        {/* Right Floating Magnetic Button */}
        <div className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
          <Magnetic strength={0.4}>
            <button
              onClick={() => scrollBy(380)}
              className="group cursor-pointer relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-paper/10 hover:bg-paper text-paper hover:text-forest backdrop-blur-2xl border border-white/20 hover:border-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-400 hover:scale-105 active:scale-95"
              aria-label="Další video"
            >
              <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-1 relative z-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Magnetic>
        </div>

        {/* Scrollable Track */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onScroll={onScroll}
          className="flex gap-4 sm:gap-6 px-6 sm:px-14 lg:px-20 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab active:cursor-grabbing snap-x snap-mandatory py-4 touch-pan-x"
        >
          {REELS.map((r, i) => {
            const isCurrent = i === active;
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
                className={`group relative shrink-0 snap-start w-[280px] sm:w-[320px] lg:w-[360px] aspect-[9/16] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-black border border-white/10 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] ${
                  isCurrent ? "ring-2 ring-white/80 scale-[1.01]" : "opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/40"
                }`}
              >
                {/* Video Player */}
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={r.src}
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
                    {lang === "cs" ? r.tagCs : r.tagEn}
                  </span>

                  {/* Sound Toggle Button on Card */}
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
                    className="cursor-pointer w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs text-paper hover:bg-forest hover:border-white/60 transition-all shadow-md active:scale-90"
                    title={muted ? t.soundOn : t.soundOff}
                  >
                    {isCurrent && !muted ? "🔊" : "🔇"}
                  </button>
                </div>

                {/* Bottom Card Captions & Direct Booking CTA */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end text-paper">
                  <p className="font-serif italic text-xl sm:text-2xl leading-snug drop-shadow-md">
                    {lang === "cs" ? r.cs : r.en}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                    <span className="label text-[11px] text-paper/70 font-mono">
                      {r.branch ? "OC Europark" : "December Hair"}
                    </span>

                    <Magnetic>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBook(r.branch || "europark");
                        }}
                        className="cursor-pointer whitespace-nowrap rounded-full bg-paper text-forest px-4 py-2 text-xs font-medium hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.35)] transition-all duration-300 active:scale-95"
                      >
                        {t.filmBook} →
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Minimalist Editorial Progress Rail */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2.5">
          {REELS.map((_, idx) => (
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
              aria-label={`Přejít na video ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
