"use client";

import { gsap, getLenis } from "./gsap";

/** The fixed bar is 64px; anything taller (the section chips on phones) would cover a section's top. */
const BASE_BAR = 64;
const extraBar = () => Math.max(0, (document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? BASE_BAR) - BASE_BAR);

/** Seconds for the glide into a section. */
const GLIDE = 1;
/** Farther than this many screens, racing past everything between feels like a blur: cut instead. */
const FAR = 1.2;
/** On a cut, the last stretch still glides in (in screens), so the arrival feels like scrolling. */
const LEAD = 0.3;
/** Seconds for the veil to cover the page before the cut, and to lift after it. */
const DIP = 0.2;
const RISE = 0.5;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// A plain sheet in the destination's own colour, laid over the page for the cut
let veil: HTMLDivElement | null = null;
const getVeil = () => {
  if (!veil) {
    veil = document.createElement("div");
    veil.setAttribute("aria-hidden", "true");
    // Under the header (z-50) so the bar stays put; over the price summary bar (z-40)
    veil.style.cssText = "position:fixed;inset:0;z-index:45;pointer-events:none;opacity:0";
    document.body.appendChild(veil);
  }
  return veil;
};
const backgroundOf = (el: HTMLElement) => {
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const bg = getComputedStyle(n).backgroundColor;
    if (bg !== "transparent" && !/,\s*0\)$/.test(bg)) return bg;
  }
  return getComputedStyle(document.body).backgroundColor;
};
let trip = 0;

/** Fired as a jump starts: where it is heading and how long the glide lasts. */
export const JUMP_EVENT = "dh:section-jump";
export type SectionJump = { id: string | null; ms: number };

let navigating = false;
/** True from a jump to a section until the visitor scrolls again, so the header stays put meanwhile. */
export const isNavigating = () => navigating;

const INPUTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
const release = () => {
  navigating = false;
  INPUTS.forEach((e) => window.removeEventListener(e, release));
};

/** Glide (or jump) to a section such as "#cenik", leaving its heading clear of the header. */
export function scrollToSection(href: string, { immediate = false } = {}) {
  const el = href === "#top" ? document.body : document.getElementById(href.slice(1));
  if (!el) return;
  const offset = href === "#top" ? 0 : -extraBar();
  release();
  navigating = true;
  INPUTS.forEach((e) => window.addEventListener(e, release, { passive: true }));

  // Measured here rather than by Lenis, whose idea of the scroll position can lag a load-time jump
  const top = href === "#top" ? 0 : el.getBoundingClientRect().top + window.scrollY + offset;
  const lenis = getLenis();
  const distance = Math.abs(top - window.scrollY);
  const mode = !lenis || immediate ? "jump" : distance > FAR * window.innerHeight ? "cut" : "glide";
  const id = ++trip;
  if (veil) gsap.killTweensOf(veil);

  // The header lights its destination at once and holds it, instead of ticking through every section passed
  const ms = mode === "jump" ? 0 : (mode === "cut" ? DIP + GLIDE : GLIDE) * 1000;
  const detail: SectionJump = { id: href === "#top" ? null : href.slice(1), ms };
  window.dispatchEvent(new CustomEvent(JUMP_EVENT, { detail }));

  // No Lenis means reduced motion: jump rather than glide
  if (mode === "jump") {
    if (veil) gsap.set(veil, { opacity: 0 });
    window.scrollTo({ top, behavior: "instant" });
    return;
  }
  if (mode === "glide") {
    if (veil) gsap.to(veil, { opacity: 0, duration: 0.2 });
    lenis!.scrollTo(top, { duration: GLIDE, force: true });
    return;
  }

  // Far away: dip into the destination's colour, cut to just short of it, and glide the last stretch
  const v = getVeil();
  v.style.backgroundColor = backgroundOf(el);
  gsap.to(v, {
    opacity: 1,
    duration: DIP,
    ease: "power1.in",
    onComplete: () => {
      if (id !== trip) return;
      const lead = Math.min(distance, LEAD * window.innerHeight) * (top > window.scrollY ? 1 : -1);
      lenis!.scrollTo(top - lead, { immediate: true, force: true });
      lenis!.scrollTo(top, { duration: GLIDE, easing: easeOut, force: true });
      gsap.to(v, { opacity: 0, duration: RISE, ease: "power2.out", delay: 0.05 });
    },
  });
}
