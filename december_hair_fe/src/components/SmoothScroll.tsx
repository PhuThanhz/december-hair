"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, MQ_MOTION } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";

/**
 * Lenis with native wheel/touch scrolling: no inertia lag, but we keep its
 * stop/start (scroll lock for loader, menu, modal) and smooth anchor scrollTo.
 */
export default function SmoothScroll() {
  // Every in-page link ("#cenik") glides to its section clear of the header and leaves the address shareable
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = (e.target as Element).closest?.("a")?.getAttribute("href");
      if (!href || href.length < 2 || !href.startsWith("#")) return;
      e.preventDefault();
      window.history.replaceState(null, "", href);
      scrollToSection(href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!window.matchMedia(MQ_MOTION).matches) return;

    const lenis = new Lenis({ smoothWheel: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
