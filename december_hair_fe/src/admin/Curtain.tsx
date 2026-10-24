"use client";

import { useSyncExternalStore } from "react";

/**
 * The way into the admin after signing in: on the sign-in page the salon's seal opens into a
 * green curtain, and the admin starts behind that same curtain and lifts it. Only after a sign-in,
 * never on page changes inside the admin, and never for visitors who ask for less motion.
 */

const KEY = "dh-admin-enter";
/** How long the curtain takes to close over the sign-in page before the admin loads */
export const CURTAIN_CLOSE_MS = 750;

export const wantsCurtain = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Called on a successful sign-in, so the admin knows to lift the curtain */
export const markEntering = () => sessionStorage.setItem(KEY, "1");

/** True right after a sign-in (read without clearing: React may call a state initializer twice) */
export const isEntering = () => typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1";
export const clearEntering = () => sessionStorage.removeItem(KEY);

/** The green curtain with the D monogram: a circle growing from `origin` over the page, or lifting away */
export function Curtain({ mode, origin, onDone }: { mode: "close" | "open"; origin?: { x: number; y: number }; onDone?: () => void }) {
  const mark = (
    <span
      className={`relative block w-20 h-24 sm:w-24 sm:h-28 bg-paper [mask:url(/images/logo-d-white.png)_center/contain_no-repeat] [-webkit-mask:url(/images/logo-d-white.png)_center/contain_no-repeat] ${
        mode === "close" ? "animate-[curtainMarkIn_0.6s_ease-out_0.2s_both]" : "animate-[curtainMarkOut_0.4s_ease-in_both]"
      }`}
    />
  );
  if (mode === "open")
    return (
      <div
        aria-hidden
        onAnimationEnd={(e) => e.target === e.currentTarget && onDone?.()}
        className="pointer-events-none fixed inset-0 z-[400] grid place-items-center bg-forest animate-[curtainOpen_0.7s_cubic-bezier(0.65,0,0.35,1)_0.1s_both]"
      >
        {mark}
      </div>
    );

  // Big enough to cover the farthest corner from where it starts
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  return (
    <div aria-hidden className="fixed inset-0 z-[400] overflow-hidden">
      <span
        className="absolute rounded-full bg-forest animate-[curtainClose_0.75s_cubic-bezier(0.65,0,0.35,1)_both]"
        style={{ left: x - r, top: y - r, width: r * 2, height: r * 2 }}
      />
      <div className="absolute inset-0 grid place-items-center">{mark}</div>
    </div>
  );
}

const noSubscribe = () => () => {};

/**
 * What the admin shows while its code loads: right after a sign-in the closed curtain,
 * so the green carries on from the sign-in page instead of flashing an empty page
 */
export function CurtainFallback() {
  const entering = useSyncExternalStore(noSubscribe, isEntering, () => false);
  if (!entering) return <div className="min-h-screen" />;
  return (
    <div aria-hidden className="fixed inset-0 z-[400] grid place-items-center bg-forest">
      <span className="block w-20 h-24 sm:w-24 sm:h-28 bg-paper [mask:url(/images/logo-d-white.png)_center/contain_no-repeat] [-webkit-mask:url(/images/logo-d-white.png)_center/contain_no-repeat]" />
    </div>
  );
}
