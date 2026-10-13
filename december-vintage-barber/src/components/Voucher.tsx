"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Dict } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION, MQ_POINTER } from "@/lib/gsap";
import Magnetic from "./Magnetic";

export default function Voucher({ t, onBook }: { t: Dict; onBook: () => void }) {
  const root = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ_MOTION, () => {
        gsap.from("[data-v-card]", {
          rotationY: -35,
          rotationX: 12,
          y: 120,
          autoAlpha: 0,
          duration: 1.8,
          ease: EASE,
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        });
        gsap.from("[data-v-title] [data-line]", {
          yPercent: 110,
          duration: 1.3,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 60%" },
        });
        gsap.from("[data-v-fade]", {
          y: 30,
          autoAlpha: 0,
          duration: 1.1,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 55%" },
        });
        // Gentle idle float
        gsap.to("[data-v-float]", { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      // Tilt + moving light under the pointer
      mm.add(MQ_POINTER, () => {
        const stage = root.current!.querySelector<HTMLElement>("[data-v-stage]")!;
        const card = root.current!.querySelector<HTMLElement>("[data-v-tilt]")!;
        const shine = root.current!.querySelector<HTMLElement>("[data-v-shine]")!;
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });

        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 24);
          rx((0.5 - py) * 20);
          shine.style.setProperty("--x", `${px * 100}%`);
          shine.style.setProperty("--y", `${py * 100}%`);
          shine.style.opacity = "1";
        };
        const leave = () => {
          rx(0);
          ry(0);
          shine.style.opacity = "0";
        };
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="poukazy" className="relative bg-forest text-paper overflow-hidden">
      {/* Large faint monogram line in the background */}
      <span
        aria-hidden
        className="absolute -left-[10vw] top-1/2 -translate-y-1/2 font-serif italic text-outline [--stroke:rgba(157,176,143,0.18)] text-[42vw] leading-none select-none pointer-events-none"
      >
        D
      </span>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 py-28 sm:py-40 grid grid-cols-12 gap-x-5 gap-y-16 items-center">
        <div data-v-stage className="col-span-12 md:col-span-6 flex justify-center [perspective:1200px]">
          <div data-v-card className="[transform-style:preserve-3d] w-[78%] max-w-[460px]">
            <div data-v-float>
              <div data-v-tilt className="relative aspect-[4/5] [transform-style:preserve-3d] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.6)]">
                <Image quality={90} src="/images/voucher-card-1000kc.png" alt={t.vouchersTitle} fill sizes="460px" className="object-cover" />
                <div
                  data-v-shine
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 mix-blend-soft-light pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.75), rgba(255,255,255,0) 45%)",
                  }}
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-paper/15 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <h2 data-v-title className="font-serif text-6xl sm:text-7xl lg:text-[7rem] leading-[0.9] tracking-[-0.03em]">
            {t.vouchersTitle.split(" ").map((w, i) => (
              <span key={i} className="line-mask">
                <span data-line className={`block ${i === 1 ? "italic text-sage" : ""}`}>
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <p data-v-fade className="mt-8 text-lg text-paper/70 max-w-md">
            {t.vouchersBody}
          </p>

          <div data-v-fade className="mt-12 grid grid-cols-2 border-t border-paper/15 max-w-md">
            {["1\u00a0000", "3\u00a0000"].map((v, i) => (
              <div key={v} className={`pt-5 whitespace-nowrap ${i ? "pl-6 border-l border-paper/15" : ""}`}>
                <span className="font-serif text-5xl md:text-4xl lg:text-5xl xl:text-6xl tabular-nums tracking-tight">{v}</span>
                <span className="ml-2 text-sm text-paper/50">Kč</span>
              </div>
            ))}
          </div>

          <div data-v-fade className="mt-12">
            <Magnetic>
              <button
                onClick={onBook}
                className="cursor-pointer rounded-full bg-paper text-forest px-8 py-4 text-sm font-medium hover:bg-sage transition-colors duration-500"
              >
                {t.vouchersCta} →
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
