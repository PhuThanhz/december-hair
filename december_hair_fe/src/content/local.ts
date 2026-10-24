import { BRANCHES, LOOKS, PANELS, REELS, SERVICES, SETTINGS, SITE_MEDIA, SOCIAL, T, VOUCHER } from "@/app/data";
import type { SiteContent } from "./types";

/** The site's content from the bundled data (the source until the back office serves it) */
export const localContent = (): SiteContent => ({
  texts: T,
  branches: BRANCHES,
  services: SERVICES,
  looks: LOOKS,
  reels: REELS,
  panels: PANELS,
  voucher: VOUCHER,
  siteMedia: SITE_MEDIA,
  social: SOCIAL,
  settings: SETTINGS,
  legal: null,
  updatedAt: "2026-10-19T00:00:00Z",
});
