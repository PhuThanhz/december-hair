"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Category, Dict } from "@/content/types";
import { useContent, useLang } from "@/content/ContentProvider";
import { gsap, useGSAP, EASE, MQ_MOTION } from "@/lib/gsap";

/**
 * "Mirrors for the whole family": everyone we cut for on one screen, like the mirrors along
 * a salon wall. Pointing at one opens it to the person it's for. No pinned or sideways scrolling.
 */
export default function Services({ t, onBook }: { t: Dict; onBook: (c?: Category) => void }) {
  // Who we look after, one mirror each. Prices live in the price list below, so this is about people.
  const { panels } = useContent();
  const lang = useLang();
  const root = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(panels[0]?.id);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.fromTo(
          "[data-svc-title] [data-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%" } }
        );
        gsap.fromTo(
          "[data-mirror]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: "[data-mirrors]", start: "top 80%" },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="sluzby" className="bg-forest text-paper px-5 sm:px-8 lg:px-12 py-24 md:py-0">
      <div className="mx-auto max-w-[1600px] md:h-[100svh] md:min-h-[680px] flex flex-col md:pt-24 md:pb-10">
        <h2 data-svc-title className="flex flex-wrap gap-x-[0.22em] font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em]">
          {t.servicesTitle.split(" ").map((w, i, all) => (
            <span key={i} className="line-mask">
              <span data-line className={`block ${i === all.length - 1 ? "italic text-sage" : ""}`}>
                {w}
              </span>
            </span>
          ))}
        </h2>

        <div data-mirrors className="mt-10 md:mt-8 flex-1 min-h-0 flex flex-col md:flex-row gap-2">
          {panels.map((p) => {
            const on = open === p.id;
            const copy = { name: p.name[lang], line: p.line[lang], tags: p.tags[lang] };
            return (
              <div
                key={p.id}
                data-mirror
                onMouseEnter={() => setOpen(p.id)}
                onClick={() => setOpen(p.id)}
                className={`group relative overflow-hidden rounded-[2px] cursor-pointer transition-[flex-grow,height] duration-700 ease-[var(--ease-out-quint)] md:h-auto md:basis-0 ${
                  on ? "h-[440px] md:grow-[2.6]" : "h-[76px] md:grow"
                }`}
              >
                <Image
                  src={p.image}
                  alt={copy.name}
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  style={{ objectPosition: p.focus }}
                  className="object-cover"
                />
                <div
                  className={`absolute inset-0 transition-colors duration-700 ${
                    on
                      ? "bg-gradient-to-t from-forest/95 via-forest/25 to-transparent"
                      : "bg-gradient-to-t from-forest/85 via-forest/25 to-forest/10 group-hover:via-transparent"
                  }`}
                />

                {/* Closed: just the name, running up the mirror */}
                <div
                  className={`absolute inset-0 p-5 flex items-center md:items-end transition-opacity duration-300 ${
                    on ? "opacity-0 pointer-events-none" : "opacity-100 delay-200"
                  }`}
                >
                  <span className="font-serif text-3xl md:text-4xl md:[writing-mode:vertical-rl] md:rotate-180 leading-none">{copy.name}</span>
                </div>

                {/* Open: who it's for and what matters to them */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 transition-[opacity,transform] duration-500 ${
                    on ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <h3 className="font-serif text-5xl lg:text-7xl leading-none tracking-[-0.02em]">{copy.name}</h3>
                  <p className="mt-4 max-w-md font-serif italic text-2xl lg:text-3xl leading-snug text-paper/90">{copy.line}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {copy.tags.map((tag) => (
                      <li key={tag} className="rounded-full border border-paper/30 px-3 py-1 text-xs text-paper/80">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook(p.bookingCategory);
                    }}
                    className="mt-7 cursor-pointer rounded-full bg-paper text-forest px-6 py-3 text-sm font-medium hover:bg-sage transition-colors"
                  >
                    {t.book} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
