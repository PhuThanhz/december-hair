"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Desktop with motion allowed: pinned / scrubbed scenes run only here. */
export const MQ_DESKTOP = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
/** Any viewport with motion allowed. */
export const MQ_MOTION = "(prefers-reduced-motion: no-preference)";
/** Fine pointer (mouse / trackpad) for cursor-driven effects. */
export const MQ_POINTER = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

export const EASE = "expo.out";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

export { gsap, ScrollTrigger, useGSAP };
