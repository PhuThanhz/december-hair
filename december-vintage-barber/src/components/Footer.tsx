"use client";

import { useRef } from "react";
import Image from "next/image";
import { SOCIAL, type Dict } from "@/app/data";
import { gsap, useGSAP, MQ_MOTION } from "@/lib/gsap";
import Magnetic from "./Magnetic";

const FEED_ITEMS = [
  { src: "/images/women-blonde-waves.webp", tag: "Balayage", likes: "894" },
  { src: "/images/men-lilac-fade.webp", tag: "Taper Fade", likes: "612" },
  { src: "/images/women-layered-copper.webp", tag: "Styling", likes: "743" },
  { src: "/images/men-hair-tattoo.webp", tag: "Hair Tattoo", likes: "528" },
  { src: "/images/care-olaplex-blonde.webp", tag: "Olaplex Péče", likes: "815" },
  { src: "/images/color-copper-mullet.webp", tag: "Color Mullet", likes: "691" },
];

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}

export default function Footer({ t }: { t: Dict }) {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        // Photos settle in softly
        gsap.from("[data-feed]", {
          autoAlpha: 0,
          scale: 0.96,
          y: 20,
          duration: 1.2,
          ease: "power3.out",
          stagger: { each: 0.08 },
          scrollTrigger: { trigger: "[data-feed-grid]", start: "top 85%" },
        });
        // The wordmark brightens letter by letter
        gsap.fromTo(
          "[data-foot-letter]",
          { opacity: 0.08 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-foot-word]", start: "top 95%", end: "bottom bottom", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <footer ref={root} className="bg-forest text-paper overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pt-20 sm:pt-28">
        {/* Social Showcase: Instagram & Facebook Co-Equal */}
        <div className="space-y-8">
          {/* Header Row: Balanced & Editorial */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-paper/10">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] text-paper">
                Sledujte naši tvorbu{" "}
                <span className="font-serif italic text-sage font-normal">na Instagramu i Facebooku</span>
              </h2>
              <p className="mt-3 text-paper/70 text-sm sm:text-base font-light leading-relaxed">
                Nové střihy, barvy a proměny každý týden ze salonů Praha, Kladno a Mladá Boleslav.
              </p>
            </div>

            {/* Dual Balanced Social Channels: Instagram & Facebook */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              {/* Instagram Card */}
              <div className="flex items-center gap-3 bg-paper/[0.06] border border-paper/15 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:border-paper/30 transition-all duration-300">
                <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm shrink-0">
                  <div className="w-full h-full rounded-full bg-forest flex items-center justify-center">
                    <InstagramIcon className="w-5 h-5 text-paper" />
                  </div>
                </div>
                <div className="pr-1">
                  <a
                    href={SOCIAL.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif italic text-base sm:text-lg text-paper hover:text-sage transition-colors block leading-tight"
                  >
                    @december.hair
                  </a>
                  <span className="text-[10px] sm:text-[11px] text-paper/60 font-mono block">
                    18.4K · Instagram
                  </span>
                </div>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper text-forest px-3.5 py-1.5 text-xs font-medium hover:bg-sage transition-all shadow-sm shrink-0 ml-auto"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  Sledovat ↗
                </a>
              </div>

              {/* Facebook Card (Equally Prominent) */}
              <div className="flex items-center gap-3 bg-paper/[0.06] border border-paper/15 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:border-paper/30 transition-all duration-300">
                <div className="relative w-11 h-11 rounded-full p-[2px] bg-[#1877F2] shadow-sm shrink-0">
                  <div className="w-full h-full rounded-full bg-forest flex items-center justify-center">
                    <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
                  </div>
                </div>
                <div className="pr-1">
                  <a
                    href={SOCIAL.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif italic text-base sm:text-lg text-paper hover:text-sage transition-colors block leading-tight"
                  >
                    December Hair
                  </a>
                  <span className="text-[10px] sm:text-[11px] text-paper/60 font-mono block">
                    Oficiální Facebook
                  </span>
                </div>
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper text-forest px-3.5 py-1.5 text-xs font-medium hover:bg-sage transition-all shadow-sm shrink-0 ml-auto"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  Sledovat ↗
                </a>
              </div>
            </div>
          </div>

          {/* 6 High-End Visual Cards Grid */}
          <div data-feed-grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEED_ITEMS.map((item) => (
              <a
                key={item.src}
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                data-feed
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-3xl bg-forest-2 border border-paper/10 shadow-lg select-none"
                aria-label={`Instagram @december.hair - ${item.tag}`}
              >
                <Image
                  src={item.src}
                  alt={item.tag}
                  fill
                  quality={90}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Subtle gradient overlay on hover with IG badge and stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3.5 sm:p-4 flex flex-col justify-between text-paper">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-forest/70 text-[10px] font-medium tracking-wide uppercase">
                      {item.tag}
                    </span>
                    <InstagramIcon className="w-3.5 h-3.5 text-paper/80" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-xs text-rose-300 font-mono">
                      <span>♥</span>
                      <span>{item.likes}</span>
                    </div>
                    <p className="text-[11px] text-paper/80 mt-0.5 font-serif italic truncate">
                      @december.hair
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mt-24 grid grid-cols-12 gap-x-5 gap-y-8 border-t border-paper/15 pt-10 text-sm">
          <p className="col-span-12 md:col-span-5 font-serif italic text-2xl text-paper/90">{t.heroLine}</p>
          <nav className="col-span-6 md:col-span-3 md:col-start-7 flex flex-col gap-2 text-paper/70">
            <a href="#sluzby" className="hover:text-paper">{t.navServices}</a>
            <a href="#cenik" className="hover:text-paper">{t.navPrices}</a>
            <a href="#salon" className="hover:text-paper">{t.navWork}</a>
            <a href="#poukazy" className="hover:text-paper">{t.navVouchers}</a>
            <a href="#pobocky" className="hover:text-paper">{t.navBranches}</a>
          </nav>
          <div className="col-span-6 md:col-span-3 flex flex-col gap-2 text-paper/70">
            <span>Praha</span>
            <span>Kladno</span>
            <span>Mladá Boleslav</span>
          </div>
        </div>

        <p
          data-foot-word
          aria-hidden
          className="mt-16 font-serif leading-[0.78] tracking-[-0.045em] whitespace-nowrap overflow-hidden text-[13.5vw] 2xl:text-[13rem] -ml-[0.04em] pb-[0.06em]"
        >
          {"December".split("").map((ch, i) => (
            <span key={i} data-foot-letter className="inline-block">
              {ch}
            </span>
          ))}
          <span data-foot-letter className="inline-block italic text-sage ml-[0.18em] tracking-[-0.02em]">
            Hair
          </span>
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 py-6 text-xs text-paper/50">
          <span>© 2026 December Hair. {t.footerRights}</span>
          <div className="flex items-center gap-5">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-paper">
              <InstagramIcon className="w-4 h-4" /> @december.hair
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-paper">
              <FacebookIcon className="w-4 h-4" /> decemberczech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
