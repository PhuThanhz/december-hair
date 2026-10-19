import type { Dict } from "@/app/data";

export type { Dict };
export type Lang = "cs" | "en";
export const LANGS: Lang[] = ["cs", "en"];

/** The four kinds of visit; fixed in v1 (their names live in the texts under `cat`) */
export type Category = "women" | "men" | "kids" | "spa";
export const CATEGORIES: Category[] = ["women", "men", "kids", "spa"];

/** The same text in both languages */
export type L10n = Record<Lang, string>;

/** One weekday's hours. weekday: 0 = Monday … 6 = Sunday; times "HH:MM" in Prague time */
export interface OpeningHours {
  weekday: number;
  opens: string;
  closes: string;
  closed: boolean;
}

/** A date that differs from the weekly hours (holiday, short day). date: "YYYY-MM-DD" */
export interface SpecialDay {
  date: string;
  opens?: string;
  closes?: string;
  closed: boolean;
  label?: L10n;
}

export interface Branch {
  /** Stable slug, e.g. "europark" */
  id: string;
  city: L10n;
  mall: string;
  /** Short name for tight spots, e.g. "OC Europark" */
  shortName: string;
  address: string;
  phone: string;
  /** Digits for tel: links */
  phoneRaw: string;
  /** Where booking requests for this salon are emailed */
  email?: string;
  /** [longitude, latitude] */
  coords: [number, number];
  /** Camera for the close-up on the map */
  map: { bearing: number; zoom: number; pitch: number };
  image: string;
  googleMapsUrl: string;
  /** "Book at …" with the right grammar, e.g. "Rezervovat v Europarku" */
  bookAt: L10n;
  hours: OpeningHours[];
  specialDays: SpecialDay[];
}

export interface Service {
  /** Stable slug; looks and other content refer to services by it */
  id: string;
  category: Category;
  name: L10n;
  note: L10n;
  durationMin: number;
  /** CZK, VAT included */
  price: number;
  /** Price is a starting price ("od") */
  priceFrom: boolean;
  image: string;
}

/** A look in the portfolio; price and time come from its service */
export interface Look {
  id: string;
  image: string;
  title: L10n;
  serviceId: string;
  /** Its own category (a men's look can use a colour service) */
  category: Category;
}

export interface Reel {
  id: string;
  video: string;
  poster: string;
  tag: L10n;
  caption: L10n;
  /** Branch id, when the reel is about one salon */
  branch?: string;
}

/** "For the whole family": one mirror per kind of guest */
export interface Panel {
  id: string;
  image: string;
  /** object-position keeping the face in a narrow mirror */
  focus: string;
  /** Where booking from this panel starts; none keeps the current choice */
  bookingCategory?: Category;
  name: L10n;
  line: L10n;
  tags: Record<Lang, string[]>;
}

export interface VideoSlot {
  src: string;
  poster: string;
}

export interface SiteMedia {
  heroPanels: (VideoSlot & { alt: L10n })[];
  heroReflection: VideoSlot;
  aboutClips: Record<"cut" | "colour" | "care", VideoSlot>;
}

export interface SiteContent {
  texts: Record<Lang, Dict>;
  branches: Branch[];
  services: Service[];
  looks: Look[];
  reels: Reel[];
  panels: Panel[];
  voucher: { options: number[]; defaultAmount: number };
  siteMedia: SiteMedia;
  social: { instagram: string; facebook: string };
  settings: { defaultBranch: string };
  legal: { companyName: string; ico: string; address: string } | null;
  updatedAt: string;
}
