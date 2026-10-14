"use client";

import { getLenis } from "./gsap";

/** The fixed bar is 64px; anything taller (the section chips on phones) would cover a section's top. */
const BASE_BAR = 64;
const extraBar = () => Math.max(0, (document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? BASE_BAR) - BASE_BAR);

const GLIDE = 1.1;

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
  const glide = Boolean(lenis && !immediate);
  // The header lights its destination at once and holds it, instead of ticking through every section passed
  const detail: SectionJump = { id: href === "#top" ? null : href.slice(1), ms: glide ? GLIDE * 1000 : 0 };
  window.dispatchEvent(new CustomEvent(JUMP_EVENT, { detail }));
  if (glide) lenis!.scrollTo(top, { duration: GLIDE, force: true });
  // No Lenis means reduced motion: jump rather than glide
  else window.scrollTo({ top, behavior: "instant" });
}
