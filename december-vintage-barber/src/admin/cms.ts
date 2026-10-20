// The CMS API's shapes (december_hair_be/app/schemas/cms.py)

export type Category = "women" | "men" | "kids" | "spa";
export const CATEGORIES: Category[] = ["women", "men", "kids", "spa"];
export type MediaKind = "image" | "video";

export interface MediaRef {
  id: number;
  kind: MediaKind;
  url: string;
  thumb: string;
  width: number | null;
  height: number | null;
  altCs: string;
  altEn: string;
}

export interface MediaItem extends MediaRef {
  mime: string;
  sizeBytes: number;
  createdAt: string;
  used: number;
}

export interface MediaUsage {
  entity: string;
  id: number;
  label: string;
  field: string;
}

export interface WeeklyHours {
  weekday: number;
  opens: string | null;
  closes: string | null;
  closed: boolean;
}

export interface SpecialDay {
  date: string;
  opens: string | null;
  closes: string | null;
  closed: boolean;
  labelCs: string | null;
  labelEn: string | null;
}

export interface BranchAdmin {
  id: number;
  slug: string;
  isPublished: boolean;
  sortOrder: number;
  cityCs: string;
  cityEn: string;
  mall: string;
  shortName: string;
  bookAtCs: string;
  bookAtEn: string;
  street: string;
  postalCode: string;
  locality: string;
  phone: string;
  email: string | null;
  lat: number;
  lng: number;
  mapBearing: number;
  mapZoom: number;
  mapPitch: number;
  googleMapsUrl: string;
  image: MediaRef | null;
  hours: WeeklyHours[];
  specialDays: SpecialDay[];
}

export interface ServiceAdmin {
  id: number;
  slug: string;
  category: Category;
  nameCs: string;
  nameEn: string;
  noteCs: string;
  noteEn: string;
  durationMin: number;
  priceCzk: number;
  priceFrom: boolean;
  image: MediaRef | null;
  isPublished: boolean;
  sortOrder: number;
  looks: number;
}

export interface LookAdmin {
  id: number;
  slug: string;
  image: MediaRef;
  titleCs: string;
  titleEn: string;
  serviceId: number;
  category: Category;
  isPublished: boolean;
  sortOrder: number;
}

export interface ReelAdmin {
  id: number;
  slug: string;
  video: MediaRef;
  poster: MediaRef | null;
  tagCs: string;
  tagEn: string;
  captionCs: string;
  captionEn: string;
  branchId: number | null;
  isPublished: boolean;
  sortOrder: number;
}

export interface PanelAdmin {
  id: number;
  slug: string;
  image: MediaRef | null;
  focus: string;
  bookingCategory: Category | null;
  nameCs: string;
  nameEn: string;
  lineCs: string;
  lineEn: string;
  tagsCs: string[];
  tagsEn: string[];
  isPublished: boolean;
  sortOrder: number;
}

export interface Slot {
  key: string;
  media: MediaRef | null;
  poster: MediaRef | null;
}

export interface PageAdmin {
  slug: string;
  titleCs: string;
  titleEn: string;
  bodyMdCs: string;
  bodyMdEn: string;
  isPublished: boolean;
}

export interface SettingsAdmin {
  instagramUrl: string;
  facebookUrl: string;
  defaultBranchId: number | null;
  notifyEmails: string[];
  legalCompanyName: string;
  legalIco: string;
  legalAddress: string;
  voucherValidityMonths: number;
  voucherDefaultAmount: number | null;
  retentionMonths: number;
  voucherOptions: { amountCzk: number; active: boolean }[];
}

export interface AuditEntry {
  id: number;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: Record<string, unknown>;
  createdAt: string;
}

/** "Hello World" → "hello-world" (Czech accents dropped), for new slugs */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
