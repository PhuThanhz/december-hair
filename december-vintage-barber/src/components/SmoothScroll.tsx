"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, MQ_MOTION } from "@/lib/gsap";

/**
 * Lenis with native wheel/touch scrolling: no inertia lag, but we keep its
 * stop/start (scroll lock for loader, menu, modal) and smooth anchor scrollTo.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(MQ_MOTION).matches) return;

    const lenis = new Lenis({ smoothWheel: false, anchors: true });
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
