"use client";

import { useEffect, useRef } from "react";
import Image, { getImageProps } from "next/image";
import type { Dict, VideoSlot } from "@/content/types";
import { useContent, useLang } from "@/content/ContentProvider";
import { gsap, useGSAP, ScrollTrigger, getLenis, EASE, MQ_DESKTOP, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";
import { loaderFor } from "@/lib/media";

// Vertical 1080×1920 clips fill a third of the screen at native sharpness
type Panel = { kind: "image" | "video"; src: string; poster?: string; alt: string };

// Both layouts are in the HTML; at each width the hidden one's posters resolve to an empty inline GIF,
// so the browser fetches only the posters it shows, straight from the HTML (no preload or lazy wait)
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const DESK = { sizes: "34vw", hideAt: "(max-width: 47.99rem)" };
const PHONE = { sizes: "100vw", hideAt: "(min-width: 48rem)" };
type Layout = typeof DESK;

function Poster({ src, layout }: { src: string; layout: Layout }) {
  // Resized and in WebP/AVIF by the image optimiser, like any next/image
  const { props } = getImageProps({ src, alt: "", fill: true, sizes: layout.sizes, loader: loaderFor(src) });
  return (
    <picture>
      <source media={layout.hideAt} srcSet={BLANK} />
      <img {...props} alt="" loading="eager" fetchPriority="high" className="object-cover" />
    </picture>
  );
}

function Clip({ p, layout }: { p: Panel; layout: Layout }) {
  return (
    <>
      {/* The poster as a real image under the clip, shown until its first frame */}
      {p.poster && <Poster src={p.poster} layout={layout} />}
      <video
        src={p.src}
        muted
        loop
        playsInline
        // playWhileVisible starts it; the hidden layout never downloads
        preload="none"
        aria-label={p.alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </>
  );
}

function Media({ p, layout }: { p: Panel; layout: Layout }) {
  if (p.kind === "video") return <Clip p={p} layout={layout} />;
  return (
    <Image
      src={p.src}
      loader={loaderFor(p.src)}
      alt={p.alt}
      fill
      priority
      quality={90}
      sizes={layout.sizes}
      className="object-cover"
    />
  );
}

const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const FRAME_START = "inset(16% 12% 16% 12%)";
const FRAME_END = "inset(0% 0% 0% 0%)";

// The brand's own "December" lettering (from the logo), as a smooth high-res alpha mask (.hero-mask in globals.css)
const MASK_RATIO = 2694 / 555;

/**
 * The logo's "December" with a black-and-white, upside-down copy of the salon clip running through
 * its letters, over the clips behind it. The tint inside follows the text colour (dark on paper,
 * light over video). A CSS mask with the logo's alpha: crisp, and supported everywhere.
 */
function Wordmark({ ready, inside }: { ready: boolean; inside: VideoSlot | null }) {
  const fill = useRef<HTMLSpanElement | null>(null);
  useEffect(() => (ready && fill.current ? playWhileVisible(fill.current) : undefined), [ready]);

  // `inside` is pre-rendered: the centre clip's middle band, flipped upside down and in black and white,
  // so the browser only decodes a small video (no CSS filter or transform to redo every frame)
  return (
    <span aria-hidden className="block overflow-hidden pb-[0.04em]">
      <span data-letter className="relative block" style={{ width: "4em", aspectRatio: MASK_RATIO }}>
        <span ref={fill} className="hero-mask absolute inset-0">
          {/* The clip behind as a reflection: upside down, black and white */}
          <video
            src={inside?.src}
            data-poster={inside?.poster ?? undefined}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Tint in the text colour keeps the word legible on paper and over video */}
          <span className="absolute inset-0 bg-current opacity-30" />
        </span>
      </span>
    </span>
  );
}

export default function Hero({ t, ready }: { t: Dict; ready: boolean }) {
  const { siteMedia } = useContent();
  const lang = useLang();
  const panels: Panel[] = siteMedia.heroPanels.map((p) => ({
    kind: "video",
    src: p.src,
    poster: p.poster ?? undefined,
    alt: p.alt[lang],
  }));
  const root = useRef<HTMLElement | null>(null);

  // The clips wait for the loader to lift (the curtain hides them anyway), so the posters, fonts and
  // scripts get the bandwidth first; they stop decoding once the visitor has scrolled past
  useEffect(() => (ready && root.current ? playWhileVisible(root.current) : undefined), [ready]);

  // Scroll scene (desktop): the centre frame opens, side panels slide in, type turns white.
  // It works as a gate: the first nudge down glides to the open triptych and holds there,
  // so a hard flick can't skip the opening frame; a nudge up glides back.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_DESKTOP, () => {
        gsap.set("[data-panel='0']", { clipPath: "inset(0% 0% 0% 100%)" });
        gsap.set("[data-panel='2']", { clipPath: "inset(0% 100% 0% 0%)" });
        gsap.set("[data-panel='1']", { clipPath: FRAME_START });
        gsap.set("[data-panel-img]", { scale: 1.08 });
        gsap.set("[data-shade]", { opacity: 0 });
        gsap.set("[data-ink]", { color: "#0f1a12" });

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.fromTo("[data-panel='1']", { clipPath: FRAME_START }, { clipPath: FRAME_END, duration: 1, immediateRender: false }, 0)
          .to("[data-panel='0']", { clipPath: FRAME_END, duration: 0.8 }, 0.2)
          .to("[data-panel='2']", { clipPath: FRAME_END, duration: 0.8 }, 0.25)
          .to("[data-panel-img]", { scale: 1, duration: 1 }, 0)
          .to("[data-shade]", { opacity: 1, duration: 0.5 }, 0.4)
          .to("[data-ink]", { color: "#f4f3ee", duration: 0.4 }, 0.45)
          .to("[data-desk-word]", { yPercent: -18, scale: 0.86, duration: 1 }, 0);

        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=75%",
          pin: true,
          scrub: 0.8,
          animation: tl,
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // Entrance, once the loader has lifted.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        if (!ready) {
          gsap.set("[data-letter]", { yPercent: 110 });
          gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 16 });
          return;
        }
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        tl.to("[data-letter]", { yPercent: 0, duration: 1.5, stagger: 0.055 })
          .from("[data-entry-frame]", { clipPath: "inset(50% 50% 50% 50%)", duration: 1.6, ease: "expo.inOut" }, 0)
          .to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.6);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} id="top" className="relative bg-paper">
      <h1 className="sr-only">December Hair — {t.heroLine}</h1>

      {/* Desktop: pinned triptych */}
      <div className="hidden md:block relative h-[100svh] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3">
          {panels.map((p, i) => (
            <div key={i} data-panel={i} className="relative overflow-hidden">
              <div data-entry-frame={i === 1 ? "" : undefined} className="absolute inset-0">
                <div data-panel-img className="absolute inset-0">
                  <Media p={p} layout={DESK} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div data-shade className="absolute inset-0 bg-forest/30 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div data-desk-word data-ink className="text-paper font-serif leading-[0.8] tracking-[-0.045em] text-[19vw] 2xl:text-[19rem]">
            <Wordmark ready={ready} inside={siteMedia.heroReflection} />
            <span data-hero-fade className="block text-right italic text-[4.2vw] 2xl:text-[4.2rem] leading-none tracking-normal -mt-[0.6vw] pr-[0.5vw]">
              Hair
            </span>
          </div>
        </div>

        <div data-ink className="absolute inset-x-0 bottom-0 px-8 lg:px-12 pb-8 grid grid-cols-12 items-end text-paper">
          <p data-hero-fade className="col-span-4 font-serif italic text-3xl lg:text-4xl leading-[1.05] max-w-[16ch]">
            {t.heroLine}
          </p>
          <p data-hero-fade className="col-span-4 col-start-9 text-right label">{t.heroCities}</p>
        </div>
      </div>

      {/* Mobile: Full-bleed Cinematic Editorial Cover */}
      <div className="md:hidden pt-20 px-3.5 pb-6">
        <div
          data-entry-frame
          className="relative min-h-[82svh] rounded-[28px] overflow-hidden bg-forest text-paper shadow-2xl flex flex-col justify-between p-6"
        >
          {/* Background Video with multi-stop luxury dark gradient */}
          <div className="absolute inset-0 z-0">
            {panels[1] && <Media p={panels[1]} layout={PHONE} />}
            <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/25 to-forest/90 pointer-events-none" />
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          </div>

          {/* Top meta tags */}
          <div data-hero-fade className="relative z-10 flex items-center justify-between text-xs">
            <span className="label tracking-[0.2em] text-[10px] text-sage border border-sage/35 rounded-full px-3 py-1 bg-forest/60 backdrop-blur-md">
              {t.heroTag}
            </span>
            <span className="label tracking-wider text-[10px] text-paper/80 font-mono">
              {t.heroPlaces}
            </span>
          </div>

          {/* Center brand mark - using crystal-clear official wordmark without GPU mask seams */}
          <div className="relative z-10 my-auto text-center py-6">
            <div className="overflow-hidden pb-1 flex justify-center">
              <div data-letter className="flex justify-center">
                <Image
                  src="/images/logo-wordmark-paper.png"
                  alt="December"
                  width={886}
                  height={173}
                  // Lazy, so desktops (where this cover is hidden) skip it; phones still fetch it straight away
                  fetchPriority="high"
                  sizes="(max-width: 436px) 78vw, 340px"
                  className="w-[78vw] max-w-[340px] h-auto object-contain"
                />
              </div>
            </div>
            <span data-hero-fade className="block italic text-[8.5vw] leading-none tracking-normal mt-2 text-sage">
              Hair
            </span>
          </div>

          {/* Bottom Slogan & Explore hint */}
          <div className="relative z-10 space-y-4">
            <p data-hero-fade className="font-serif italic text-2xl leading-[1.1] text-paper max-w-[18ch]">
              {t.heroLine}
            </p>
            <div data-hero-fade className="flex items-center justify-between pt-3 border-t border-paper/20 text-paper/80">
              <span className="label text-[10px] text-paper/75 tracking-wider">{t.heroCities}</span>
              <span className="label text-[10px] text-sage flex items-center gap-1.5 font-mono animate-pulse">
                {t.heroScroll} ↓
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
