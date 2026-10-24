"use client";

import { useEffect, useState, type RefObject } from "react";

/** Whether the element is on (or near) the screen; used to pause endless animations off screen. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "100px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
