import type { ImageLoader } from "next/image";

// The widths the media library stores, besides each image's own width (backend app/services/media.py)
const WIDTHS = [640, 1080, 1920, 2560];
// A library image is its largest variant: /media/<hash>/<width>.webp
const VARIANT = /^(\/media\/[0-9a-f]{64})\/(\d+)\.webp$/;

/**
 * Library images come pre-sized in WebP, so they skip the Next optimiser: pick the smallest
 * stored width that covers what the browser asks for. A replaced image gets a new hash, so its
 * URL changes and no cache serves the old one.
 */
const mediaLoader: ImageLoader = ({ src, width }) => {
  const m = VARIANT.exec(src);
  if (!m) return src;
  const full = Number(m[2]);
  const stored = [...WIDTHS.filter((w) => w < full), full];
  return `${m[1]}/${stored.find((w) => w >= width) ?? full}.webp`;
};

/** The loader for a src: the library's own sizes for /media images, the Next optimiser otherwise */
export const loaderFor = (src: string) => (VARIANT.test(src) ? mediaLoader : undefined);
