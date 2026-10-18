"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { REELS, type Dict, type Lang } from "@/app/data";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");

/** 35mm Vintage Film Perforations (Sprocket Holes) */
function SprocketTrack({ label }: { label: string }) {
  return (
    <div className="bg-[#060c08] border-y border-white/10 px-4 py-2 flex items-center justify-between gap-6 overflow-hidden select-none" aria-hidden>
      <div className="flex items-center gap-3 shrink-0 opacity-45">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="w-3.5 h-2 rounded-[2px] bg-black border border-white/20 shrink-0 shadow-inner" />
        ))}
      </div>
      <div className="flex items-center gap-6 text-[9.5px] font-mono tracking-[0.28em] text-amber-300/70 uppercase whitespace-nowrap shrink-0">
        <span>● KODAK 5219 VISION3</span>
        <span className="hidden sm:inline">SAFETY FILM</span>
        <span>{label}</span>
        <span className="hidden md:inline">24 FPS · 35MM</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 opacity-45">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="w-3.5 h-2 rounded-[2px] bg-black border border-white/20 shrink-0 shadow-inner" />
        ))}
      </div>
    </div>
  );
}

/**
 * Proměny — Editorial 35mm Film Strip.
 * A luxury cinema exhibition strip flowing horizontally across the page.
 * Unpinned: vertical scrolling remains 100% natural and fluid.
 * Visitors can pan horizontally, drag, or use precision arrows to explore
 * high-res transformation reels with vintage amber stamps and live audio.
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
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);

  // Drag-to-pan state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  // Update muted state across videos
  useEffect(() => {
    videos.current.forEach((v, i) => {
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

  return (
    <section ref={root} className="relative z-10 bg-[#09110b] text-paper overflow-hidden py-20 lg:py-28 border-t border-paper/10">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[1200px] h-[75vh] bg-[radial-gradient(closest-side,rgb(63_107_44/0.22),transparent)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-paper/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <p className="label tracking-[0.25em] text-[10px] sm:text-xs text-sage uppercase font-mono">
                {lang === "cs" ? "Archiv 35mm · Filmové proměny" : "35mm Film Archive · Salon Transformations"}
              </p>
            </div>
            <h2 className="mt-3 font-serif italic text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              {t.reelsTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-paper/70 font-serif italic max-w-xl">
              {lang === "cs"
                ? "Každý den tvoříme nové příběhy vašich vlasů. Prohlédněte si proměny našich klientů zachycené na filmový pás."
                : "Every day we shape new stories for your hair. Discover our clients' transformations captured on authentic film."}
            </p>
          </div>

          {/* Interactive Navigation & Controls */}
          <div className="flex items-center gap-4 sm:gap-6 self-start lg:self-end">
            <span className="hidden sm:inline-block label text-[10px] text-paper/40 font-mono tracking-widest">
              {lang === "cs" ? "← TAŽENÍM NEBO ŠIPKAMI →" : "← DRAG OR ARROWS →"}
            </span>

            {/* Prev / Next precision buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollBy(-360)}
                className="cursor-pointer w-10 h-10 rounded-full border border-paper/20 flex items-center justify-center text-sm text-paper/80 hover:text-paper hover:border-paper hover:bg-paper/10 active:scale-95 transition-all shadow-sm"
                aria-label="Předchozí"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy(360)}
                className="cursor-pointer w-10 h-10 rounded-full border border-paper/20 flex items-center justify-center text-sm text-paper/80 hover:text-paper hover:border-paper/60 hover:bg-paper/10 active:scale-95 transition-all shadow-sm"
                aria-label="Další"
              >
                →
              </button>
            </div>

            {/* Global sound toggle */}
            <button
              onClick={() => {
                const nextMuted = !muted;
                setMuted(nextMuted);
                if (videos.current[active]) {
                  videos.current[active]!.muted = nextMuted;
                  videos.current[active]!.play().catch(() => {});
                }
              }}
              className="cursor-pointer flex items-center gap-2 rounded-full border border-paper/20 bg-forest/40 backdrop-blur-md px-4 py-2 text-xs text-paper/90 hover:text-paper hover:border-paper/50 active:scale-95 transition-all shadow-xs"
            >
              <span>{muted ? "🔇" : "🔊"}</span>
              <span className="hidden sm:inline font-mono text-[10px]">
                {muted ? (lang === "cs" ? "Zapnout zvuk" : "Sound on") : (lang === "cs" ? "Vypnout zvuk" : "Mute")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* The 35mm Continuous Film Strip */}
      <div className="relative mt-8 select-none">
        {/* Top Sprocket Track */}
        <SprocketTrack label="DECEMBER HAIR · PRAGUE · 2026" />

        {/* Horizontal Film Frames Rail */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="flex gap-4 sm:gap-6 py-6 px-5 sm:px-8 lg:px-12 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab active:cursor-grabbing touch-pan-x"
        >
          {REELS.map((r, i) => {
            const isCurrent = i === active;
            return (
              <article
                key={r.id}
                onClick={() => {
                  if (hasMoved.current) return;
                  setActive(i);
                  if (videos.current[i]) {
                    videos.current[i]!.play().catch(() => {});
                  }
                }}
                className={`group relative shrink-0 w-[290px] sm:w-[320px] lg:w-[350px] bg-[#070d09] border-[10px] sm:border-[14px] border-[#070d09] rounded-xl overflow-hidden transition-all duration-500 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.85)] ${
                  isCurrent ? "ring-2 ring-amber-400/60 scale-[1.01]" : "opacity-90 hover:opacity-100 hover:ring-1 hover:ring-paper/30"
                }`}
              >
                {/* 35mm Film Frame Edge Headers */}
                <div className="bg-[#070d09] px-2.5 py-1.5 flex items-center justify-between text-[9px] font-mono text-amber-300/80 border-b border-white/10 tracking-widest uppercase">
                  <span>EXP.{pad(i + 1)} · 35MM</span>
                  <span className="text-paper/40 font-mono">FRAME {pad(i + 1)}A</span>
                  <span className="text-amber-400/90 font-bold">{pad(i + 1)}/06</span>
                </div>

                {/* Video Container (9:16 vertical ratio) */}
                <div className="relative aspect-[9/16] bg-black overflow-hidden">
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                    }}
                    src={r.src}
                    data-poster={r.poster}
                    muted={i === active ? muted : true}
                    loop
                    playsInline
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Film Grain & Lighting Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none" />

                  {/* Dynamic Film Badges */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-paper">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{lang === "cs" ? r.tagCs : r.tagEn}</span>
                  </div>

                  {/* Sound indicator badge */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(i);
                      const nextMuted = isCurrent ? !muted : false;
                      setMuted(nextMuted);
                      if (videos.current[i]) {
                        videos.current[i]!.muted = nextMuted;
                        videos.current[i]!.play().catch(() => {});
                      }
                    }}
                    className="cursor-pointer absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs text-paper hover:bg-forest hover:border-amber-400/60 transition-all shadow-md"
                    title={muted ? t.soundOn : t.soundOff}
                  >
                    {isCurrent && !muted ? "🔊" : "🔇"}
                  </button>

                  {/* Bottom Captions & Booking CTA inside Frame */}
                  <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end text-paper">
                    <p className="font-serif italic text-lg sm:text-xl leading-snug line-clamp-2 drop-shadow-md">
                      {lang === "cs" ? r.cs : r.en}
                    </p>

                    <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                      <span className="label text-[10px] text-amber-200/80 font-mono tracking-wider">
                        {r.branch ? "OC Europark" : "December Hair"}
                      </span>
                      <Magnetic>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBook(r.branch || "europark");
                          }}
                          className="cursor-pointer whitespace-nowrap rounded-full bg-paper text-forest px-3.5 py-1.5 text-xs font-medium hover:bg-sage transition-all duration-300 shadow-sm active:scale-95"
                        >
                          {t.filmBook} →
                        </button>
                      </Magnetic>
                    </div>
                  </div>
                </div>

                {/* 35mm Film Frame Edge Footer */}
                <div className="bg-[#070d09] px-2.5 py-1.5 flex items-center justify-between text-[9px] font-mono text-paper/40 border-t border-white/10 tracking-widest uppercase">
                  <span>▲ SAFETY 400T</span>
                  <span className="text-amber-400/60">PRAHA · KLADNO</span>
                  <span>ISO 400</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Sprocket Track */}
        <SprocketTrack label="DECEMBER 35MM · EXPOSURE ARCHIVE · 2026" />
      </div>
    </section>
  );
}
