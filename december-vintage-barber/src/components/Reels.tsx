"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import type { Dict, Lang } from "@/app/data";
import { playWhileVisible } from "@/lib/video";
import Magnetic from "./Magnetic";

const pad = (n: number) => String(n).padStart(2, "0");

interface Transformation {
  id: string;
  tagCs: string;
  tagEn: string;
  titleCs: string;
  titleEn: string;
  descCs: string;
  descEn: string;
  duration: string;
  price: string;
  branch: string;
  beforeImg: string;
  afterVideo: string;
  afterPoster: string;
}

const TRANSFORMATIONS: Transformation[] = [
  {
    id: "balayage",
    tagCs: "Balayage & Styling",
    tagEn: "Balayage & Styling",
    titleCs: "Světlé tóny & přirozený lesk",
    titleEn: "Bright tones & natural glow",
    descCs: "Z unavené barvy na zářivý balayage s hedvábnou texturou a jemnými vlnami.",
    descEn: "From tired tone to radiant balayage with silky texture and soft waves.",
    duration: "180 min",
    price: "od 2 490 Kč",
    branch: "europark",
    beforeImg: "/images/women-layered-copper.webp",
    afterVideo: "/videos/reel-balayage.mp4",
    afterPoster: "/videos/reel-balayage-poster.jpg",
  },
  {
    id: "fade",
    tagCs: "Pánský Fade & Vousy",
    tagEn: "Skin Fade & Beard",
    titleCs: "Dokonalé kontury a přechod",
    titleEn: "Razor-sharp contours & blend",
    descCs: "Přechod strojkem do ztracena, horký ručník a břitvou tvarované linie vousů.",
    descEn: "Clean skin taper fade, hot towel ritual, and razor-sculpted beard line.",
    duration: "50 min",
    price: "od 790 Kč",
    branch: "europark",
    beforeImg: "/images/men-textured-taper.webp",
    afterVideo: "/videos/europark.mp4",
    afterPoster: "/videos/europark-poster.jpg",
  },
  {
    id: "blonde",
    tagCs: "Platinová Blond & Péče",
    tagEn: "Platinum Blonde & Care",
    titleCs: "Hloubková obnova a čistá blond",
    titleEn: "Deep revival & luminous blonde",
    descCs: "Neutralizace teplých tónů, kúra pro zpevnění vlasových vazeb a luxusní lesk.",
    descEn: "Neutralising brassy tones, bond-building therapy, and mirror-like shine.",
    duration: "120 min",
    price: "od 1 890 Kč",
    branch: "kladno",
    beforeImg: "/images/care-olaplex-blonde.webp",
    afterVideo: "/videos/reel-blonde.mp4",
    afterPoster: "/videos/reel-blonde-poster.jpg",
  },
  {
    id: "care",
    tagCs: "Head Spa Rituál",
    tagEn: "Head Spa Ritual",
    titleCs: "Parní lázeň a relaxační masáž",
    titleEn: "Steam therapy & scalp massage",
    descCs: "Totální restart pro vlasy i mysl. Peeling pokožky, aromaterapie a regenerace.",
    descEn: "Total rejuvenation for scalp and soul with herbal steam and deep massage.",
    duration: "60 min",
    price: "1 290 Kč",
    branch: "europark",
    beforeImg: "/images/service-hair-wash-massage.png",
    afterVideo: "/videos/reel-care.mp4",
    afterPoster: "/videos/reel-care-poster.jpg",
  },
  {
    id: "colour",
    tagCs: "Kreativní Barva & Mullet",
    tagEn: "Creative Colour & Mullet",
    titleCs: "Odvaha, kontrast a osobitost",
    titleEn: "Bold contrast & character",
    descCs: "Precizní tónování do měděno-fialových odstínů a dynamický vrstvený střih.",
    descEn: "Vibrant copper-lilac dimension paired with an edgy, effortless textured cut.",
    duration: "150 min",
    price: "od 2 190 Kč",
    branch: "bondy",
    beforeImg: "/images/color-copper-mullet.webp",
    afterVideo: "/videos/reel-colour.mp4",
    afterPoster: "/videos/reel-colour-poster.jpg",
  },
  {
    id: "kids",
    tagCs: "Dětský Moderní Střih",
    tagEn: "Kids Modern Cut",
    titleCs: "Styl a úsměv pro nejmenší",
    titleEn: "Style & joy for little heroes",
    descCs: "Trpělivý přístup bez slziček, módní střih s texturou a zážitek ze salonu.",
    descEn: "Gentle, tear-free styling tailored for confidence and all-day energy.",
    duration: "30 min",
    price: "390 Kč",
    branch: "europark",
    beforeImg: "/images/haircut-kid-fade.png",
    afterVideo: "/videos/reel-kids.mp4",
    afterPoster: "/videos/reel-kids-poster.jpg",
  },
];

/**
 * Proměny — The Magic Hair Wand (Interactive Before & After Split).
 * - Visitors can slide the golden magic wand horizontally to reveal live hair transformation.
 * - Left side: Before state (raw styling / initial condition).
 * - Right side: After state (live glossy video / finished salon look).
 * - 6 distinct transformation stories selectable in 1 tap.
 * - 100% unpinned and fluid vertical scrolling on both mobile and desktop.
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState(false);
  const [muted, setMuted] = useState(true);

  const activeItem = TRANSFORMATIONS[activeIdx];

  // Update position based on pointer event
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Video playback management
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) {
        v.muted = i === activeIdx ? muted : true;
        if (i === activeIdx) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, [activeIdx, muted]);

  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

  return (
    <section ref={root} className="relative z-10 bg-[#070e09] text-paper overflow-hidden py-16 sm:py-24 lg:py-28 border-t border-paper/10">
      {/* Ambient Luxury Spotlights */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] h-[650px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(63,107,44,0.18),transparent_70%)] z-0" />
      <div className="pointer-events-none absolute right-12 top-1/4 w-[50vw] max-w-[650px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(217,119,6,0.12),transparent_70%)] z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-paper/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <p className="label tracking-[0.25em] text-[10px] sm:text-xs text-amber-300/80 font-mono uppercase">
                {lang === "cs" ? "Kouzelná hůlka proměny · Before & After" : "The Magic Hair Wand · Before & After"}
              </p>
            </div>
            <h2 className="mt-2.5 font-serif italic text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              {t.reelsTitle}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-paper/70 font-serif italic max-w-md">
            {lang === "cs"
              ? "Táhněte zlatou linkou a odhalte proměnu z původního stavu do živého mistrovského díla."
              : "Drag the golden wand to reveal the transformation from initial state to a living masterpiece."}
          </p>
        </div>

        {/* Mobile: Horizontal Transformation Selector Pills */}
        <div className="lg:hidden mt-6 -mx-5 px-5 flex gap-2 overflow-x-auto [scrollbar-width:none] select-none py-1">
          {TRANSFORMATIONS.map((item, i) => {
            const isCurrent = i === activeIdx;
            return (
              <button
                key={item.id}
                onClick={() => setActiveIdx(i)}
                className={`cursor-pointer whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-2 ${
                  isCurrent
                    ? "bg-amber-400 text-forest font-semibold shadow-md scale-100"
                    : "bg-forest/50 border border-white/10 text-paper/70 hover:text-paper"
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{pad(i + 1)}</span>
                <span>{lang === "cs" ? item.tagCs : item.tagEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Comparison Screen + Details Sidebar */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Center: The Magic Hair Wand Before/After Screen */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[16/10] rounded-[28px] sm:rounded-[36px] overflow-hidden select-none cursor-ew-resize touch-pan-y shadow-[0_25px_65px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/15 bg-black"
            >
              {/* Layer 1: BEFORE (Base Layer - Left Side) */}
              <div className="absolute inset-0">
                <Image
                  src={activeItem.beforeImg}
                  alt="Před proměnou"
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover filter contrast-[0.95] brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-black/25 pointer-events-none" />

                {/* BEFORE Label Badge */}
                <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-mono tracking-wider text-paper/90 shadow-md">
                  <span>{lang === "cs" ? "PŘEDTÍM (PŮVODNÍ)" : "BEFORE (INITIAL)"}</span>
                </div>
              </div>

              {/* Layer 2: AFTER (Clipped Live Video Layer - Right Side) */}
              <div
                className="absolute inset-0 z-10 transition-[clip-path] duration-75 ease-out"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                {TRANSFORMATIONS.map((item, i) => (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      i === activeIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={item.afterVideo}
                      data-poster={item.afterPoster}
                      muted={i === activeIdx ? muted : true}
                      loop
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* AFTER Label Badge */}
                <div className="absolute top-5 right-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/90 text-forest font-bold backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.5)] text-[11px] font-mono tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                  <span>{lang === "cs" ? "POTOM (DECEMBER HAIR)" : "AFTER (DECEMBER HAIR)"}</span>
                </div>
              </div>

              {/* The Magic Hair Wand Divider Line & Interactive Handle */}
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Glowing Laser/Hairline Divider */}
                <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />

                {/* Interactive Scissors Handle */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0c180f] border-2 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.7)] flex items-center justify-center text-xs font-mono font-bold">
                  <span className="text-sm">✂</span>
                </div>
              </div>

              {/* Bottom Interactive Controls Inside Frame */}
              <div className="absolute bottom-4 inset-x-5 z-25 flex items-center justify-between pointer-events-none">
                {/* Sound Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }}
                  className="pointer-events-auto cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs text-paper hover:bg-forest hover:border-amber-400/60 transition-all shadow-md active:scale-95"
                  title={muted ? t.soundOn : t.soundOff}
                >
                  <span>{muted ? "🔇" : "🔊"}</span>
                  <span className="font-mono text-[10px]">
                    {muted ? (lang === "cs" ? "Zvuk" : "Sound") : (lang === "cs" ? "Hraje" : "Playing")}
                  </span>
                </button>

                {/* Drag Hint */}
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-paper/70">
                  <span>← {lang === "cs" ? "Táhněte nůžkami" : "Drag the shears"} →</span>
                </div>
              </div>
            </div>

            {/* Mobile swipe hint */}
            <p className="lg:hidden mt-3 text-center label text-[10px] text-paper/50 font-mono tracking-widest">
              {lang === "cs" ? "TAŽENÍM NŮŽKAMI ODKRYJTE ROZDÍL" : "DRAG THE SHEARS TO REVEAL DIFFERENCE"}
            </p>
          </div>

          {/* Right Column: Transformation Details & 6-Item Selector (Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-6">
            {/* Active Card Details Card */}
            <div className="p-6 sm:p-7 rounded-[26px] bg-[#0c180f] border border-amber-400/30 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.7)]">
              <div className="flex items-center justify-between">
                <span className="label text-xs uppercase font-mono px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {lang === "cs" ? activeItem.tagCs : activeItem.tagEn}
                </span>
                <span className="font-mono text-xs text-paper/40">
                  {pad(activeIdx + 1)} / {pad(TRANSFORMATIONS.length)}
                </span>
              </div>

              <h3 className="mt-3.5 font-serif italic text-2xl sm:text-3xl leading-snug">
                {lang === "cs" ? activeItem.titleCs : activeItem.titleEn}
              </h3>

              <p className="mt-2 text-sm text-paper/75 font-serif italic leading-relaxed">
                {lang === "cs" ? activeItem.descCs : activeItem.descEn}
              </p>

              {/* Fact Chips */}
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-paper/40 block text-[10px]">{lang === "cs" ? "Doba trvání" : "Duration"}</span>
                  <span className="text-amber-200 font-semibold">{activeItem.duration}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-paper/40 block text-[10px]">{lang === "cs" ? "Cena služby" : "Price"}</span>
                  <span className="text-amber-200 font-semibold">{activeItem.price}</span>
                </div>
              </div>

              {/* Instant Booking CTA */}
              <div className="mt-6">
                <Magnetic>
                  <button
                    onClick={() => onBook(activeItem.branch)}
                    className="w-full cursor-pointer rounded-full bg-paper text-forest py-3 px-6 text-sm font-medium hover:bg-amber-300 transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{lang === "cs" ? "Rezervovat tuto proměnu" : "Book this transformation"}</span>
                    <span>→</span>
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* Desktop: 6 Transformation Selectors Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-2.5">
              {TRANSFORMATIONS.map((item, idx) => {
                const isSelected = idx === activeIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between min-h-[75px] ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400 text-amber-200 shadow-sm"
                        : "bg-[#0c180f]/50 border-white/10 text-paper/60 hover:border-white/25 hover:text-paper hover:bg-[#0c180f]"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60">{pad(idx + 1)}</span>
                    <span className="text-xs font-medium font-serif italic truncate mt-1">
                      {lang === "cs" ? item.tagCs : item.tagEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
