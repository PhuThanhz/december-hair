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

  // Posters given as data-poster load only once the section comes within a screen or so, and only for
  // clips in the layout that's showing (a hidden one never fetches its poster)
  const showPoster = (v: HTMLVideoElement) => {
    if (v.dataset.poster && !v.getAttribute("poster")) v.poster = v.dataset.poster;
  };
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        // The whole section at once, so cards still scrolled sideways out of view have theirs too;
        // each clip is watched as well, for a layout that only appears after a resize
        if (e.target === root) videos.filter((v) => v.getClientRects().length).forEach(showPoster);
        else showPoster(e.target as HTMLVideoElement);
      }
    },
    { rootMargin: "1200px" }
  );
  near.observe(root);
  videos.filter((v) => v.dataset.poster).forEach((v) => near.observe(v));

  // Re-check when a video gains or loses data-hold
  const mo = new MutationObserver((records) => records.forEach((r) => sync(r.target as HTMLVideoElement)));
  videos.forEach((v) => mo.observe(v, { attributes: true, attributeFilter: ["data-hold"] }));

  return () => {
    io.disconnect();
    near.disconnect();
    mo.disconnect();
  };
}
