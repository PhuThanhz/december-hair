"use client";

/**
 * Plays each <video> under `root` only while it is near the viewport, so off-screen
 * clips stop decoding. Videos marked `data-hold` stay paused (e.g. hidden cross-fade layers).
 * Returns a cleanup function.
 */
export function playWhileVisible(root: Element) {
  const videos = Array.from(root.querySelectorAll("video"));
  const visible = new Set<HTMLVideoElement>();

  const sync = (v: HTMLVideoElement) => {
    if (!visible.has(v) || v.hasAttribute("data-hold")) {
      v.pause();
      return;
    }
    // Browsers refuse unmuted autoplay without a fresh gesture: fall back to muted instead of freezing
    v.play().catch(() => {
      if (v.muted) return;
      v.muted = true;
      v.play().catch(() => {});
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) visible.add(v);
        else visible.delete(v);
        sync(v);
      }
    },
    { rootMargin: "150px" }
  );
  videos.forEach((v) => io.observe(v));

  // Re-check when a video gains or loses data-hold
  const mo = new MutationObserver((records) => records.forEach((r) => sync(r.target as HTMLVideoElement)));
  videos.forEach((v) => mo.observe(v, { attributes: true, attributeFilter: ["data-hold"] }));

  return () => {
    io.disconnect();
    mo.disconnect();
  };
}
