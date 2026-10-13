"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MQ_POINTER } from "@/lib/gsap";

/**
 * A small dot that trails the pointer. Over links it grows into a ring;
 * over anything with data-cursor="Label" it becomes a disc with that label.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement | null>(null);
  const disc = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(MQ_POINTER).matches || !root.current || !disc.current) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const xTo = gsap.quickTo(root.current, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(root.current, "y", { duration: 0.45, ease: "power3" });

    let hasMoved = false;
    let lastX = -100;
    let lastY = -100;
    let mode = "";
    let currentLabel = "";

    const setMode = (next: string, text = "") => {
      if (next === mode && text === currentLabel) return;

      const modeChanged = next !== mode;
      mode = next;
      currentLabel = text;
      setLabel(text);

      root.current!.style.mixBlendMode = next === "label" ? "normal" : "difference";
      const size = next === "label" ? 104 : next === "link" ? 44 : 10;

      gsap.to(disc.current, {
        width: size,
        height: size,
        backgroundColor: next === "link" ? "rgba(244,243,238,0)" : next === "label" ? "#3f6b2c" : "#f4f3ee",
        borderWidth: next === "link" ? 1 : 0,
        duration: modeChanged ? 0.45 : 0.2,
        ease: "expo.out",
      });
    };

    const updateCursor = (el: HTMLElement | null) => {
      if (!el) {
        setMode("dot");
        return;
      }
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setMode("label", labelled.dataset.cursor ?? "");
      } else if (el.closest("a, button, select, input, label")) {
        setMode("link");
      } else {
        setMode("dot");
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(root.current, { x: e.clientX, y: e.clientY, autoAlpha: 1 });
      }
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(e.clientX);
      yTo(e.clientY);
      updateCursor(e.target as HTMLElement);
    };

    const onClick = () => {
      setTimeout(() => {
        if (lastX >= 0 && lastY >= 0) {
          const el = document.elementFromPoint(lastX, lastY) as HTMLElement | null;
          updateCursor(el);
        }
      }, 40);
    };

    const onScroll = () => {
      if (lastX >= 0 && lastY >= 0) {
        const el = document.elementFromPoint(lastX, lastY) as HTMLElement | null;
        updateCursor(el);
      }
    };

    const onLeave = () => gsap.to(root.current, { autoAlpha: 0, duration: 0.3 });
    const onEnter = () => gsap.to(root.current, { autoAlpha: 1, duration: 0.3 });

    // Initial state: hidden until pointer enters / moves
    gsap.set(root.current, { autoAlpha: 0 });

    window.addEventListener("pointermove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className={`fixed left-0 top-0 z-[300] pointer-events-none mix-blend-difference ${enabled ? "" : "hidden"}`}
    >
      <div
        ref={disc}
        className="-translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-paper border-paper border-solid flex items-center justify-center p-2 text-center select-none shadow-lg overflow-hidden"
      >
        {label && (
          <span
            className={`label text-paper uppercase leading-tight flex flex-col items-center justify-center text-center ${
              label.length === 1 ? "text-base tracking-normal" : "text-[0.62rem] tracking-[0.14em]"
            }`}
          >
            {label.includes(" ") ? (
              label.split(" ").map((w, idx) => (
                <span key={idx} className="block">{w}</span>
              ))
            ) : (
              <span className="block">{label}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
