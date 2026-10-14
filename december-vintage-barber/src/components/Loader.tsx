"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, getLenis, MQ_MOTION } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";

/** Flowing hair strands, the same curves that live inside the "D" of the logo. */
function Strands() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 300 + i * 34;
        return (
          <path
            key={i}
            data-strand
            d={`M-40 ${y} C 380 ${y - 160 + i * 6}, 620 ${y + 190 - i * 8}, 960 ${y - 20} S 1420 ${y - 170 + i * 12}, 1660 ${y + 40}`}
            fill="none"
            stroke="#9db08f"
            strokeWidth="1"
            strokeOpacity={0.18 + i * 0.05}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/**
 * Intro: hair strands draw across the screen, the December HAIR mark appears,
 * a single "scissor" line cuts through the middle and the green curtain
 * splits open while the mark flies up and lands on the header brand.
 */
export default function Loader({ line, onDone }: { line: string; onDone: () => void }) {
  const root = useRef<HTMLDivElement | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const target = document.querySelector<HTMLElement>("[data-header-brand]");
      const extras = document.querySelectorAll<HTMLElement>("[data-header-after]");

      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        onDone();
      };
      const finish = () => {
        gsap.set(target, { autoAlpha: 1 });
        gsap.to(extras, { autoAlpha: 1, duration: 0.6 });
        setGone(true);
        getLenis()?.start();
        try {
          sessionStorage.setItem("dh-intro", "1");
        } catch {}
        start();
      };

      // A link straight to a section (…/#cenik) skips the intro and lands there
      const section = window.location.hash.length > 1 ? document.getElementById(window.location.hash.slice(1)) : null;
      // The intro plays once per visit; reloads and returns in the same tab go straight to the page
      let seen = false;
      try {
        seen = sessionStorage.getItem("dh-intro") === "1";
      } catch {}

      if (!window.matchMedia(MQ_MOTION).matches || !target || seen || section) {
        finish();
        // Wait for the pinned scenes and the fonts, so the section is measured where it really is
        if (section) document.fonts.ready.then(() => window.setTimeout(() => scrollToSection(`#${section.id}`, { immediate: true }), 60));
        return;
      }

      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      getLenis()?.stop();
      gsap.set(target, { autoAlpha: 0 });
      gsap.set(extras, { autoAlpha: 0 });

      const brand = root.current!.querySelector<HTMLElement>("[data-brand]")!;
      // Centre of an element's layout box, optionally ignoring its own transform
      const centre = (el: HTMLElement, own = false) => {
        const r = el.getBoundingClientRect();
        const m = own ? new DOMMatrixReadOnly(getComputedStyle(el).transform) : null;
        return { x: r.left + r.width / 2 - (m?.m41 ?? 0), y: r.top + r.height / 2 - (m?.m42 ?? 0) };
      };

      root.current!.querySelectorAll<SVGPathElement>("[data-strand]").forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      // Any scroll, tap or key cuts straight to the curtain opening. Until the page underneath is
      // ready that input only speeds things up; it doesn't scroll the page behind the curtain.
      let locked = true;
      const inputs = ["wheel", "touchmove", "touchstart", "pointerdown", "keydown"] as const;
      const scrollKeys = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
      const skip = (e: Event) => {
        if (tl.time() < tl.labels.open) tl.seek("open");
        const scrolls = e.type === "wheel" || e.type === "touchmove" || (e instanceof KeyboardEvent && scrollKeys.includes(e.key));
        if (locked && scrolls && e.cancelable) e.preventDefault();
      };
      const unlisten = () => inputs.forEach((e) => window.removeEventListener(e, skip));
      inputs.forEach((e) => window.addEventListener(e, skip, { passive: false }));

      const tl = gsap.timeline({
        onComplete: () => {
          unlisten();
          finish();
        },
      });
      // Brisk: the page is usable about two seconds in
      tl.timeScale(1.4);
      tl.to("[data-strand]", { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.07 }, 0)
        .fromTo(
          "[data-brand-word]",
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
          0.35
        )
        .from("[data-hair-letter]", { yPercent: 120, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 1.2)
        .from("[data-loader-line]", { yPercent: 110, duration: 1, ease: "expo.out" }, 1.45)

        // The cut: one bright line sweeps across, then everything parts along it
        .fromTo("[data-cut]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 2.5)
        .to(["[data-loader-line]", "[data-strands]"], { autoAlpha: 0, duration: 0.4 }, 2.75)
        .addLabel("open", 3.15)
        .to("[data-half='top']", { yPercent: -100, duration: 1.3, ease: "expo.inOut" }, "open")
        .to("[data-half='bottom']", { yPercent: 100, duration: 1.3, ease: "expo.inOut" }, "open")
        .to("[data-cut]", { autoAlpha: 0, duration: 0.3 }, "open")
        .to(
          brand,
          {
            x: () => centre(target).x - centre(brand, true).x,
            y: () => centre(target).y - centre(brand, true).y,
            scale: () => target.getBoundingClientRect().width / brand.offsetWidth,
            duration: 1.3,
            ease: "expo.inOut",
          },
          "open"
        )
        .to("[data-logo-ink]", { opacity: 1, duration: 0.7, ease: "power2.out" }, "open+=0.4")
        .to("[data-hair-word]", { color: "#56604f", duration: 0.7, ease: "power2.out" }, "open+=0.4")
        .add(() => {
          locked = false;
          start();
        }, "open+=0.45");

      return unlisten;
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
      {/* Curtain in two halves so it can part along the cut */}
      <div data-half="top" className="absolute inset-x-0 top-0 h-1/2 bg-forest pointer-events-auto" />
      <div data-half="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-forest pointer-events-auto" />

      <div data-strands className="absolute inset-0">
        <Strands />
      </div>

      <span data-cut className="absolute left-0 right-0 top-1/2 h-px bg-paper origin-left scale-x-0" />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Same proportions as the header brand (22px logo, 10px HAIR) so it lands exactly */}
        <div data-brand className="flex items-end will-change-transform [--h:min(10vw,120px)]">
          <div data-brand-word className="relative h-[var(--h)] aspect-[886/173]">
            <Image src="/images/logo-wordmark-paper.png" alt="December" fill priority sizes="620px" className="object-contain" />
            <Image
              data-logo-ink
              src="/images/logo-wordmark-ink.png"
              alt=""
              fill
              priority
              sizes="620px"
              className="object-contain opacity-0"
            />
          </div>
          <span
            data-hair-word
            className="uppercase text-paper overflow-hidden ml-[calc(var(--h)*0.3636)] pt-[calc(var(--h)*0.1818)] text-[calc(var(--h)*0.4545)] leading-none tracking-[0.32em]"
          >
            {"HAIR".split("").map((c, i) => (
              <span key={i} data-hair-letter className="inline-block">
                {c}
              </span>
            ))}
          </span>
        </div>

        <span className="line-mask mt-[calc(min(10vw,120px)*0.9)]">
          <span data-loader-line className="block label text-sage tracking-[0.3em]">
            {line}
          </span>
        </span>
      </div>
    </div>
  );
}
