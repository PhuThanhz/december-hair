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
      {/* Ambient Luxury Lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[1100px] h-[650px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(63,107,44,0.18),transparent_70%)] z-0" />
      <div className="pointer-events-none absolute right-10 top-1/3 w-[50vw] max-w-[700px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(217,119,6,0.12),transparent_70%)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-paper/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <p className="label tracking-[0.25em] text-[10px] sm:text-xs text-amber-300/80 font-mono uppercase">
                {lang === "cs" ? "Zákulisí & Služby salonu" : "Behind the Scenes & Services"}
              </p>
            </div>
            <h2 className="mt-2.5 font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              {t.reelsTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-paper/70 font-serif italic max-w-lg">
              {lang === "cs"
                ? "Nahlédněte do atmosféry našich salonů v Praze, Kladně a Mladé Boleslavi."
                : "Experience the unique atmosphere of our salons in Prague, Kladno and Mladá Boleslav."}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 self-start sm:self-end">
            <span className="hidden sm:inline-block label text-[10px] text-paper/40 font-mono tracking-wider">
              {pad(active + 1)} / {pad(REELS.length)}
            </span>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollBy(-360)}
                className="cursor-pointer w-10 h-10 rounded-full border border-paper/20 bg-forest/30 backdrop-blur-md flex items-center justify-center text-sm text-paper/80 hover:text-paper hover:border-paper hover:bg-forest transition-all shadow-sm active:scale-95"
                aria-label="Předchozí video"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy(360)}
                className="cursor-pointer w-10 h-10 rounded-full border border-paper/20 bg-forest/30 backdrop-blur-md flex items-center justify-center text-sm text-paper/80 hover:text-paper hover:border-paper hover:bg-forest transition-all shadow-sm active:scale-95"
                aria-label="Další video"
              >
                →
              </button>
            </div>

            {/* Global sound toggle */}
            <button
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                if (videoRefs.current[active]) {
                  videoRefs.current[active]!.muted = nextMuted;
                  videoRefs.current[active]!.play().catch(() => {});
                }
              }}
              className="cursor-pointer flex items-center gap-2 rounded-full border border-paper/20 bg-forest/40 backdrop-blur-md px-4 py-2 text-xs text-paper/90 hover:text-paper hover:border-paper/50 active:scale-95 transition-all shadow-xs"
            >
              <span>{muted ? "🔇" : "🔊"}</span>
              <span className="hidden sm:inline font-mono text-[10px]">
                {muted ? (lang === "cs" ? "Zapnout zvuk" : "Sound on") : (lang === "cs" ? "Ztlumit" : "Mute")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Studio Video Cards Track */}
      <div className="relative mt-8 sm:mt-12 select-none">
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onScroll={onScroll}
          className="flex gap-4 sm:gap-6 px-5 sm:px-8 lg:px-12 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab active:cursor-grabbing snap-x snap-mandatory py-4 touch-pan-x"
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
                  isCurrent ? "ring-2 ring-amber-400/80 scale-[1.01]" : "opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/30"
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

                  <span className="label text-[10px] font-mono text-paper/70 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    {pad(i + 1)}/06
                  </span>
                </div>

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
                  className="cursor-pointer absolute top-14 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-xs text-paper hover:bg-forest hover:border-amber-400/50 transition-all shadow-md active:scale-90"
                  title={muted ? t.soundOn : t.soundOff}
                >
                  {isCurrent && !muted ? "🔊" : "🔇"}
                </button>

                {/* Bottom Card Captions & Direct Booking CTA */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end text-paper">
                  <p className="font-serif italic text-xl sm:text-2xl leading-snug drop-shadow-md">
                    {lang === "cs" ? r.cs : r.en}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                    <span className="label text-[11px] text-amber-300 font-mono">
                      {r.branch ? "OC Europark" : "December Hair"}
                    </span>

                    <Magnetic>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBook(r.branch || "europark");
                        }}
                        className="cursor-pointer whitespace-nowrap rounded-full bg-paper text-forest px-4 py-2 text-xs font-medium hover:bg-amber-300 transition-all duration-300 shadow-sm active:scale-95"
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
      </div>
    </section>
  );
}
