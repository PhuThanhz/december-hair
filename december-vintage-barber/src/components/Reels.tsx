"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { REELS, type Dict, type Lang } from "@/app/data";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");

const AUTO_INTERVAL = 6500; // 6.5s per transformation story

/**
 * Proměny — The Master Transformation Showcase.
 * - Desktop: Grand two-column luxury editorial layout (interactive style selector + cinematic video canvas).
 * - Mobile: Edge-to-edge immersive cinema card with touch swipe & one-tap category pills.
 * - Auto-advances gently with a luxury progress indicator; pauses on hover.
 * - 100% natural vertical scrolling on both mobile and laptop with ZERO traps.
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
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const currentReel = REELS[active];

  // Touch gesture state for mobile swiping
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Auto-advance progress timer
  useEffect(() => {
    if (isPaused) return;

    setProgress(0);
    const start = performance.now();

    const frame = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / AUTO_INTERVAL) * 100);
      setProgress(pct);

      if (elapsed < AUTO_INTERVAL) {
        animId = requestAnimationFrame(frame);
      } else {
        setActive((prev) => (prev + 1) % REELS.length);
      }
    };

    let animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [active, isPaused]);

  // Keep muted synchronized
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) {
        v.muted = i === active ? muted : true;
        if (i === active) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, [active, muted]);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  const handleSelect = useCallback((index: number) => {
    setActive(index);
    setProgress(0);
  }, []);

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Check if horizontal swipe was dominant and past threshold
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe left -> Next
        handleSelect((active + 1) % REELS.length);
      } else {
        // Swipe right -> Prev
        handleSelect((active - 1 + REELS.length) % REELS.length);
      }
    }
  };

  return (
    <section
      ref={root}
      className="relative z-10 bg-[#08100a] text-paper overflow-hidden py-16 sm:py-24 lg:py-28 border-t border-paper/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Luxury Lighting Glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(63,107,44,0.18),transparent_70%)] z-0" />
      <div className="pointer-events-none absolute right-10 bottom-10 w-[50vw] max-w-[700px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(217,119,6,0.12),transparent_70%)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Header with Title & Live Story Indicators */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-paper/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <p className="label tracking-[0.25em] text-[10px] sm:text-xs text-amber-300/80 font-mono uppercase">
                {lang === "cs" ? "Proměny v salonu · Live Stories" : "Salon Transformations · Live Stories"}
              </p>
            </div>
            <h2 className="mt-2.5 font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              {t.reelsTitle}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-paper/70 font-serif italic max-w-md">
            {lang === "cs"
              ? "Skutečné proměny našich klientů. Každý střih a barva jsou jedinečným podpisem našeho týmu."
              : "Real transformations of our clients. Every cut and colour is a signature of our team."}
          </p>
        </div>

        {/* Mobile: Horizontal Swipeable Category Pills */}
        <div className="lg:hidden mt-6 -mx-5 px-5 flex gap-2 overflow-x-auto [scrollbar-width:none] select-none py-1">
          {REELS.map((r, i) => {
            const isCurrent = i === active;
            return (
              <button
                key={r.id}
                onClick={() => handleSelect(i)}
                className={`cursor-pointer whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                  isCurrent
                    ? "bg-paper text-forest shadow-md font-semibold scale-100"
                    : "bg-forest/50 border border-white/10 text-paper/70 hover:text-paper hover:bg-forest"
                }`}
              >
                <span className="font-mono text-[10px] opacity-60">{pad(i + 1)}</span>
                <span>{lang === "cs" ? r.tagCs : r.tagEn}</span>
              </button>
            );
          })}
        </div>

        {/* Master Showcase Layout: Two columns on desktop, unified stacked on mobile */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Interactive Style Menu (Desktop) */}
          <div className="hidden lg:block lg:col-span-6 space-y-3">
            {REELS.map((r, i) => {
              const isCurrent = i === active;
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelect(i)}
                  className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isCurrent
                      ? "bg-[#112015] border-amber-400/40 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6)]"
                      : "bg-[#0b160e]/50 border-white/5 hover:border-white/15 hover:bg-[#0f1d13]/60"
                  }`}
                >
                  {/* Active Progress Bar Underlay */}
                  {isCurrent && (
                    <div
                      className="absolute left-0 bottom-0 top-0 bg-amber-400/5 rounded-2xl transition-[width] duration-100 ease-linear pointer-events-none"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Numeric Indicator */}
                      <span
                        className={`font-mono text-sm pt-1 transition-colors ${
                          isCurrent ? "text-amber-300 font-bold" : "text-paper/40 group-hover:text-paper/70"
                        }`}
                      >
                        {pad(i + 1)}
                      </span>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`label text-xs uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full ${
                              isCurrent
                                ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                                : "bg-white/5 text-paper/60 border border-white/10"
                            }`}
                          >
                            {lang === "cs" ? r.tagCs : r.tagEn}
                          </span>
                          {r.branch && (
                            <span className="text-[11px] text-paper/40 font-mono">
                              • {r.branch === "europark" ? "OC Europark" : r.branch}
                            </span>
                          )}
                        </div>

                        {/* Title Quote */}
                        <p
                          className={`mt-2 font-serif italic text-xl transition-colors ${
                            isCurrent ? "text-paper font-medium" : "text-paper/70 group-hover:text-paper"
                          }`}
                        >
                          {lang === "cs" ? r.cs : r.en}
                        </p>
                      </div>
                    </div>

                    {/* Arrow / Playing indicator */}
                    <div className="shrink-0 pt-1">
                      {isCurrent ? (
                        <div className="flex items-end gap-1 h-4 px-2 py-1 rounded bg-amber-400/15 border border-amber-400/30">
                          <span className="w-1 h-full bg-amber-400 animate-[pulse_0.6s_infinite]" />
                          <span className="w-1 h-2/3 bg-amber-400 animate-[pulse_0.4s_infinite_0.2s]" />
                          <span className="w-1 h-4/5 bg-amber-400 animate-[pulse_0.8s_infinite_0.4s]" />
                        </div>
                      ) : (
                        <span className="text-paper/30 group-hover:text-paper/70 transition-colors text-sm font-mono">
                          →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active bottom accent bar */}
                  {isCurrent && (
                    <div className="absolute left-5 right-5 bottom-0 h-0.5 bg-gradient-to-r from-amber-400/80 via-amber-300 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column (Desktop) & Centerpiece (Mobile): Grand Arched Cinema Canvas */}
          <div
            className="lg:col-span-6 flex flex-col items-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[460px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-[#243a29] via-[#15251a] to-[#0c160f] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
              {/* Inner Video Container */}
              <div className="relative w-full h-full rounded-[26px] sm:rounded-[32px] overflow-hidden bg-black">
                {REELS.map((r, i) => (
                  <div
                    key={r.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      i === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={r.src}
                      data-poster={r.poster}
                      muted={i === active ? muted : true}
                      loop
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-black/35 pointer-events-none" />

                {/* Top Controls: Sound Toggle & Swipe Hint */}
                <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-paper">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{pad(active + 1)} / {pad(REELS.length)}</span>
                  </div>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setMuted(!muted)}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs text-paper hover:bg-forest hover:border-amber-400/60 transition-all shadow-md active:scale-95"
                    title={muted ? t.soundOn : t.soundOff}
                  >
                    <span>{muted ? "🔇" : "🔊"}</span>
                    <span className="font-mono text-[10px]">
                      {muted ? (lang === "cs" ? "Zvuk" : "Sound") : (lang === "cs" ? "Hraje" : "Playing")}
                    </span>
                  </button>
                </div>

                {/* Mobile Navigation Arrows Overlay */}
                <div className="absolute inset-y-0 inset-x-2 z-25 flex items-center justify-between pointer-events-none lg:hidden">
                  <button
                    onClick={() => handleSelect((active - 1 + REELS.length) % REELS.length)}
                    className="pointer-events-auto cursor-pointer w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-paper text-sm active:scale-90"
                    aria-label="Předchozí"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleSelect((active + 1) % REELS.length)}
                    className="pointer-events-auto cursor-pointer w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-paper text-sm active:scale-90"
                    aria-label="Další"
                  >
                    →
                  </button>
                </div>

                {/* Bottom Story Description & Quick Booking Button */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-30 flex flex-col justify-end text-paper">
                  <span className="label text-xs text-amber-300 font-mono tracking-wider">
                    {lang === "cs" ? currentReel.tagCs : currentReel.tagEn}
                  </span>

                  <p className="mt-1.5 font-serif italic text-2xl sm:text-3xl leading-snug drop-shadow-lg">
                    {lang === "cs" ? currentReel.cs : currentReel.en}
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
                    <span className="label text-[11px] text-paper/70 font-mono">
                      {currentReel.branch ? "OC Europark" : "December Hair"}
                    </span>

                    <Magnetic>
                      <button
                        onClick={() => onBook(currentReel.branch || "europark")}
                        className="cursor-pointer whitespace-nowrap rounded-full bg-paper text-forest px-5 py-2.5 text-xs sm:text-sm font-medium hover:bg-sage transition-all duration-300 shadow-md active:scale-95"
                      >
                        {t.filmBook} →
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile swipe hint */}
            <p className="lg:hidden mt-3 text-center label text-[10px] text-paper/50 font-mono tracking-widest">
              {lang === "cs" ? "← TAŽENÍM NEBO ŠIPKAMI PŘEPÍNEJTE →" : "← SWIPE OR USE ARROWS →"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
