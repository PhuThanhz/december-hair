"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, ScrollTrigger, getLenis, EASE, MQ_DESKTOP, MQ_MOTION } from "@/lib/gsap";
import { playWhileVisible } from "@/lib/video";

type Panel = { kind: "image" | "video"; src: string; poster?: string; alt: string };

// Vertical 1080×1920 clips fill a third of the screen at native sharpness
const PANELS: Panel[] = [
  // Same clip as the right panel, pre-rotated to start 9.5 s in so the two never show the same shot
  // (a separate file avoids a mid-file seek, which made the browser download the clip twice)
  { kind: "video", src: "/videos/december-hair-b.mp4", poster: "/videos/december-hair-b-poster.jpg", alt: "Salon December" },
  { kind: "video", src: "/videos/europark.mp4", poster: "/videos/europark-poster.jpg", alt: "Nový salon December v Europarku" },
  { kind: "video", src: "/videos/december-hair.mp4", poster: "/videos/december-hair-poster.jpg", alt: "Den v salonu December" },
];

function Clip({ p }: { p: Panel }) {
  return (
    <video
      src={p.src}
      poster={p.poster}
      muted
      loop
      playsInline
      // playWhileVisible starts it; the hidden layout (desktop on phones and vice versa) never downloads
      preload="none"
      aria-label={p.alt}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

function Media({ p, sizes }: { p: Panel; sizes: string }) {
  if (p.kind === "video") return <Clip p={p} />;
  return <Image src={p.src} alt={p.alt} fill priority quality={90} sizes={sizes} className="object-cover" />;
}

const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const FRAME_START = "inset(16% 12% 16% 12%)";
const FRAME_END = "inset(0% 0% 0% 0%)";

// The wordmark is drawn in SVG so the very same glyphs can clip a clip playing inside them.
const GLYPH = 200; // font size in SVG units

/**
 * "December" with a mirrored copy of the salon clip running through its letters, over the
 * clips behind it. The tint inside follows the text colour (dark on paper, light over video).
 * Clipping uses an SVG clipPath on an HTML box, which Chrome, Safari and Firefox all support.
 */
function Wordmark({ id }: { id: string }) {
  const text = useRef<SVGTextElement | null>(null);
  const fill = useRef<HTMLSpanElement | null>(null);
  const [box, setBox] = useState<[number, number, number, number] | null>(null);

  // Measure the real glyphs once the web font is in, so the clip fits the letters exactly
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      const b = text.current?.getBBox();
      if (alive && b) setBox([b.x, b.y, b.width, b.height]);
    });
    return () => {
      alive = false;
    };
  }, []);

  // The clip inside only exists once measured, so it registers its own play-while-visible
  useEffect(() => (box && fill.current ? playWhileVisible(fill.current) : undefined), [box]);

  const [x, y, w, h] = box ?? [0, -150, 1180, 190];
  const inside = PANELS[1];

  return (
    <span aria-hidden className="block overflow-hidden pb-[0.04em]">
      <span data-letter className="relative inline-block align-top">
        <svg viewBox={`${x} ${y} ${w} ${h}`} style={{ width: `${w / GLYPH}em` }} className="block h-auto overflow-visible">
          <defs>
            <clipPath id={id} clipPathUnits="objectBoundingBox">
              <use href={`#${id}-glyphs`} transform={`scale(${1 / w} ${1 / h}) translate(${-x} ${-y})`} />
            </clipPath>
          </defs>
          <text id={`${id}-glyphs`} ref={text} x="0" y="0" fontSize={GLYPH} style={{ letterSpacing: -0.045 * GLYPH }} fill="currentColor">
            December
          </text>
        </svg>
        {box && (
          <span ref={fill} className="absolute inset-0" style={{ clipPath: `url(#${id})` }}>
            {/* The clip behind, mirrored, so the letters read as a reflection */}
            <video
              src={inside.src}
              poster={inside.poster}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            {/* Tint in the text colour keeps the word legible on paper and over video */}
            <span className="absolute inset-0 bg-current opacity-30" />
          </span>
        )}
      </span>
    </span>
  );
}

export default function Hero({ t, ready }: { t: Dict; ready: boolean }) {
  const root = useRef<HTMLElement | null>(null);

  // The hero clips stop decoding once the visitor has scrolled past
  useEffect(() => (root.current ? playWhileVisible(root.current) : undefined), []);

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
          .to("[data-panel='0']", { clipPath: FRAME_END, duration: 0.8 }, 0.35)
          .to("[data-panel='2']", { clipPath: FRAME_END, duration: 0.8 }, 0.45)
          .to("[data-panel-img]", { scale: 1, duration: 1.25 }, 0)
          .to("[data-shade]", { opacity: 1, duration: 0.6 }, 0.5)
          .to("[data-ink]", { color: "#f4f3ee", duration: 0.5 }, 0.55)
          .to("[data-desk-word]", { yPercent: -18, scale: 0.86, duration: 1.25 }, 0);

        // Lenis is created in an effect that runs after this layout effect, so look it up lazily
        let state: "closed" | "moving" | "open" = "closed";
        let hold = 0;
        // Only real gestures open the gate; layout shifts and scroll restoration also move scrollY
        let lastInput = -1e9;
        const input = () => (lastInput = performance.now());
        const inputs = ["wheel", "touchmove", "keydown"] as const;
        inputs.forEach((e) => window.addEventListener(e, input, { passive: true }));
        const glide = (st: ScrollTrigger, open: boolean) => {
          const lenis = getLenis();
          if (!lenis) return;
          state = "moving";
          lenis.scrollTo(open ? st.end : st.start, {
            duration: open ? 1.4 : 1.1,
            easing: inOutCubic,
            lock: true,
            onComplete: () => {
              state = open ? "open" : "closed";
              // Swallow the tail of a trackpad flick so it doesn't carry on past the frame
              lenis.stop();
              hold = window.setTimeout(() => lenis.start(), 450);
            },
          });
        };

        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=110%",
          pin: true,
          scrub: true,
          animation: tl,
          onUpdate: (st) => {
            const lenis = getLenis();
            if (!lenis || state === "moving" || performance.now() - lastInput > 400) return;
            // Someone else's smooth scroll (menu links): let it pass straight through
            if (lenis.isScrolling === "smooth") {
              state = st.progress > 0.5 ? "open" : "closed";
              return;
            }
            if (state === "closed" && st.direction === 1 && st.progress > 0) glide(st, true);
            else if (state === "open" && st.direction === -1 && st.progress < 1) glide(st, false);
          },
          onLeave: () => state !== "moving" && (state = "open"),
          onLeaveBack: () => state !== "moving" && (state = "closed"),
        });

        return () => {
          window.clearTimeout(hold);
          inputs.forEach((e) => window.removeEventListener(e, input));
          getLenis()?.start();
        };
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
          {PANELS.map((p, i) => (
            <div key={i} data-panel={i} className="relative overflow-hidden">
              <div data-entry-frame={i === 1 ? "" : undefined} className="absolute inset-0">
                <div data-panel-img className="absolute inset-0">
                  <Media p={p} sizes="34vw" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div data-shade className="absolute inset-0 bg-forest/30 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div data-desk-word data-ink className="text-paper font-serif leading-[0.8] tracking-[-0.045em] text-[19vw] 2xl:text-[19rem]">
            <Wordmark id="wordmark-desk" />
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

      {/* Mobile */}
      <div className="md:hidden pt-24 px-5 pb-10">
        <div className="font-serif leading-[0.8] tracking-[-0.045em] text-[19.5vw] -ml-1">
          <Wordmark id="wordmark-mob" />
          <span data-hero-fade className="block text-right italic text-[7vw] leading-none tracking-normal mt-1 text-moss">
            Hair
          </span>
        </div>
        <div data-entry-frame className="relative mt-8 aspect-[4/5] overflow-hidden bg-forest">
          <Media p={PANELS[1]} sizes="100vw" />
        </div>
        <p data-hero-fade className="mt-6 font-serif italic text-3xl leading-[1.05]">{t.heroLine}</p>
        <p data-hero-fade className="label text-ink-soft mt-4">{t.heroCities}</p>
      </div>
    </section>
  );
}
