"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { REELS, type Dict, type Lang, type Reel } from "@/app/data";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");

/** 35mm Sprocket Holes component for individual film cells */
function SprocketsRow() {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#050906] border-b border-white/10 select-none" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="w-3.5 h-2 rounded-[2px] bg-black border border-white/25 shadow-inner" />
      ))}
    </div>
  );
}

function SprocketsBottom() {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#050906] border-t border-white/10 select-none" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="w-3.5 h-2 rounded-[2px] bg-black border border-white/25 shadow-inner" />
      ))}
    </div>
  );
}

/**
 * Proměny — Vintage 35mm Cinematic Film Stream.
 * Features:
 * - Continuous infinite film roll (silky smooth auto-glide, pauses on hover)
 * - 35mm sprocket perforations & Kodak edge code typography
 * - Dynamic audio visualizer & live timecode on active cells
 * - Cinema Screening Lightbox modal on click with full audio and booking
 * - 100% natural vertical scrolling with zero scroll hijacking or traps
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalReel, setModalReel] = useState<Reel | null>(null);
  const [modalMuted, setModalMuted] = useState(false);
  const modalVideo = useRef<HTMLVideoElement | null>(null);

  // Running timecode ticker for cinema vibe
  const [timecode, setTimecode] = useState("00:04:12:18");
  useEffect(() => {
    let frame = 18;
    let sec = 12;
    const interval = setInterval(() => {
      frame = (frame + 1) % 25;
      if (frame === 0) sec = (sec + 1) % 60;
      setTimecode(`00:04:${pad(sec)}:${pad(frame)}`);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Handle escape key to close cinema modal
  useEffect(() => {
    if (!modalReel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalReel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalReel]);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  return (
    <section ref={root} className="relative z-10 bg-[#070e09] text-paper overflow-hidden py-20 lg:py-28 border-t border-paper/10">
      {/* Cinematic Projector Light Beam: Ambient cone of light shining down */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[85vw] max-w-[1100px] h-[550px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(157,176,143,0.18),transparent_75%)] z-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[40vw] max-w-[600px] h-[400px] bg-[conic-gradient(from_80deg_at_50%_0%,transparent_0deg,rgba(246,244,238,0.06)_15deg,transparent_30deg)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-paper/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <p className="label tracking-[0.25em] text-[10px] sm:text-xs text-amber-300/80 font-mono uppercase">
                {lang === "cs" ? "Archiv 35mm · Filmové proměny" : "35mm Film Archive · Salon Transformations"}
              </p>
              <span className="text-paper/30 font-mono text-xs">/</span>
              <span className="font-mono text-[10px] text-paper/50 tracking-wider tabular-nums">{timecode}</span>
            </div>
            <h2 className="mt-3 font-serif italic text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              {t.reelsTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-paper/70 font-serif italic max-w-xl">
              {lang === "cs"
                ? "Dải phim điện ảnh ghi lại khoảnh khắc lột xác của từng mái tóc. Rê chuột để dừng phim, click để xem phóng to."
                : "A continuous cinematic 35mm film reel capturing the art of hair transformation. Hover to pause, click to project."}
            </p>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-4 text-xs font-mono text-paper/60 self-start md:self-end">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-amber-300/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CONTINUOUS REEL · 24 FPS</span>
            </span>
          </div>
        </div>
      </div>

      {/* 35mm Continuous Rolling Film Strip */}
      <div className="relative mt-8 select-none">
        {/* Top Film Stock Label Strip */}
        <div className="bg-[#050906] border-y border-white/10 px-6 py-1.5 flex items-center justify-between text-[9px] font-mono tracking-[0.3em] text-amber-300/60 uppercase select-none">
          <span>● KODAK 5219 VISION3 · 35MM MOTION PICTURE FILM</span>
          <span className="hidden md:inline">EASTMAN COLOR ARCHIVE · PRAGUE · 2026</span>
          <span>SAFE FOR PROJECTION ▲</span>
        </div>

        {/* Silky-Smooth Continuous Marquee */}
        <div className="py-6">
          <Marquee speed={32} pauseOnHover={true} gradient={false} className="overflow-visible py-4">
            {REELS.map((r, i) => {
              const isHovered = hoveredId === r.id;
              return (
                <div
                  key={r.id}
                  onMouseEnter={() => setHoveredId(r.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    setModalReel(r);
                    setModalMuted(false);
                  }}
                  className={`group relative mx-3.5 w-[280px] sm:w-[310px] lg:w-[330px] bg-[#050906] border-[8px] sm:border-[10px] border-[#050906] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 transform-gpu ${
                    isHovered
                      ? "-translate-y-2.5 scale-[1.03] ring-2 ring-amber-400/90 shadow-[0_25px_60px_-12px_rgba(245,158,11,0.35)]"
                      : "opacity-90 hover:opacity-100 ring-1 ring-white/15 shadow-[0_16px_36px_-12px_rgba(0,0,0,0.85)]"
                  }`}
                >
                  {/* Sprocket Holes Top */}
                  <SprocketsRow />

                  {/* Top Edge Code */}
                  <div className="bg-[#050906] px-3 py-1 flex items-center justify-between text-[8.5px] font-mono text-amber-300/80 tracking-widest uppercase border-b border-white/10">
                    <span>EXP.{pad(i + 1)} · 35MM</span>
                    <span className="text-paper/40">FRAME {pad(i + 1)}A</span>
                    <span className="text-amber-400 font-bold">{pad(i + 1)}/06</span>
                  </div>

                  {/* Video Area (9:16 vertical ratio) */}
                  <div className="relative aspect-[9/16] bg-black overflow-hidden">
                    <video
                      src={r.src}
                      data-poster={r.poster}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="none"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Overlay for luxury readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/35 pointer-events-none" />

                    {/* Top Film Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-paper">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{lang === "cs" ? r.tagCs : r.tagEn}</span>
                    </div>

                    {/* Top Right: Live Audio Equalizer Bars */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="w-[2px] h-full bg-amber-400 animate-[pulse_0.6s_infinite]" />
                        <span className="w-[2px] h-2/3 bg-amber-400 animate-[pulse_0.4s_infinite_0.2s]" />
                        <span className="w-[2px] h-4/5 bg-amber-400 animate-[pulse_0.8s_infinite_0.4s]" />
                        <span className="w-[2px] h-1/2 bg-amber-400 animate-[pulse_0.5s_infinite_0.1s]" />
                      </div>
                      <span className="text-[9px] font-mono text-amber-300/80 ml-1">PLAY</span>
                    </div>

                    {/* Center Hover Projector Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="w-14 h-14 rounded-full bg-amber-400/90 text-forest flex items-center justify-center text-xl shadow-[0_0_30px_rgba(251,191,36,0.6)] transform group-hover:scale-110 transition-transform duration-300">
                        ▶
                      </span>
                    </div>

                    {/* Bottom Captions & Booking Button */}
                    <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end text-paper">
                      <p className="font-serif italic text-lg leading-snug line-clamp-2 drop-shadow-md">
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

                  {/* Bottom Edge Code */}
                  <div className="bg-[#050906] px-3 py-1 flex items-center justify-between text-[8.5px] font-mono text-paper/40 tracking-widest uppercase border-t border-white/10">
                    <span>▲ SAFETY 400T</span>
                    <span className="text-amber-400/70">PRAHA · KLADNO</span>
                    <span>ISO 400</span>
                  </div>

                  {/* Sprocket Holes Bottom */}
                  <SprocketsBottom />
                </div>
              );
            })}
          </Marquee>
        </div>

        {/* Bottom Film Stock Label Strip */}
        <div className="bg-[#050906] border-y border-white/10 px-6 py-1.5 flex items-center justify-between text-[9px] font-mono tracking-[0.3em] text-amber-300/60 uppercase select-none">
          <span>● DECEMBER 35MM · MASTER NEGATIVE ARCHIVE</span>
          <span className="hidden md:inline">COLOR TIMED BY DECEMBER SALON</span>
          <span>SAFETY FILM ▲</span>
        </div>
      </div>

      {/* Cinema Screening Lightbox Modal (Click to project in full glory) */}
      {modalReel && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalReel(null)}
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#060c08] border-[12px] border-[#060c08] rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] animate-[panelIn_0.4s_ease-out]"
          >
            {/* Top Film Frame Stamp */}
            <div className="bg-[#060c08] px-4 py-2 flex items-center justify-between text-xs font-mono text-amber-300 border-b border-white/10 tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>35MM CINEMA SCREENING</span>
              </span>
              <button
                onClick={() => setModalReel(null)}
                className="cursor-pointer text-paper/70 hover:text-paper text-sm px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                aria-label={t.close}
              >
                ✕ {t.close}
              </button>
            </div>

            {/* Modal Video Player */}
            <div className="relative aspect-[9/16] max-h-[70vh] mx-auto bg-black overflow-hidden">
              <video
                ref={modalVideo}
                src={modalReel.src}
                muted={modalMuted}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Sound toggle button */}
              <button
                onClick={() => setModalMuted(!modalMuted)}
                className="cursor-pointer absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs text-paper hover:bg-forest transition-colors shadow-lg"
              >
                <span>{modalMuted ? "🔇" : "🔊"}</span>
                <span className="font-mono text-[10px]">
                  {modalMuted ? (lang === "cs" ? "Zapnout zvuk" : "Unmute") : (lang === "cs" ? "Ztlumit" : "Mute")}
                </span>
              </button>
            </div>

            {/* Modal Details & Booking */}
            <div className="p-6 bg-[#060c08] border-t border-white/10 text-paper">
              <div className="flex items-center justify-between">
                <span className="label text-xs text-amber-300 font-mono">
                  {lang === "cs" ? modalReel.tagCs : modalReel.tagEn}
                </span>
                <span className="label text-xs text-paper/50 font-mono">
                  {modalReel.branch ? "OC Europark Praha" : "December Hair"}
                </span>
              </div>
              <p className="mt-2 font-serif italic text-2xl leading-tight">
                {lang === "cs" ? modalReel.cs : modalReel.en}
              </p>

              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  onClick={() => setModalReel(null)}
                  className="cursor-pointer text-xs font-mono text-paper/60 hover:text-paper link-line"
                >
                  ← {lang === "cs" ? "Zpět na dải phim" : "Back to reel"}
                </button>
                <Magnetic>
                  <button
                    onClick={() => {
                      const branchId = modalReel.branch || "europark";
                      setModalReel(null);
                      onBook(branchId);
                    }}
                    className="cursor-pointer rounded-full bg-paper text-forest px-6 py-2.5 text-xs sm:text-sm font-medium hover:bg-sage transition-colors duration-300 shadow-md active:scale-95"
                  >
                    {t.filmBook} →
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
