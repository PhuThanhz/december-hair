import type { Branch, OpeningHours } from "@/content/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** The salons' clock: weekday (0 = Monday), date and time in Prague, whatever the visitor's own timezone */
export function pragueNow(d = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  );
  return {
    weekday: WEEKDAYS.indexOf(parts.weekday),
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/** Opening and closing time on a given day (a special day wins over the weekly hours); null when closed */
export function hoursOn(b: Branch, weekday: number, date?: string): { opens: string; closes: string } | null {
  const special = date ? b.specialDays.find((s) => s.date === date) : undefined;
  if (special) return special.closed || !special.opens || !special.closes ? null : { opens: special.opens, closes: special.closes };
  const day = b.hours.find((h) => h.weekday === weekday);
  return !day || day.closed || !day.opens || !day.closes ? null : { opens: day.opens, closes: day.closes };
}

/** Is the salon open right now; if so until when, if not when it opens next */
export function openState(b: Branch, now = new Date()) {
  const p = pragueNow(now);
  const today = hoursOn(b, p.weekday, p.date);
  if (today && p.time >= today.opens && p.time < today.closes) return { open: true, time: today.closes };
  if (today && p.time < today.opens) return { open: false, time: today.opens };
  // Closed for today: the next day it opens (special days are only known for today)
  for (let i = 1; i <= 7; i++) {
    const next = hoursOn(b, (p.weekday + i) % 7);
    if (next) return { open: false, time: next.opens };
  }
  return { open: false, time: "" };
}

const openDays = (b: Branch) => b.hours.filter((h) => !h.closed && h.opens && h.closes);

/** Latest regular closing time across the salons, e.g. "20:00" */
export function latestClose(branches: Branch[]) {
  return branches.flatMap((b) => openDays(b).map((h) => h.closes ?? "")).sort().reverse()[0] ?? "";
}

/** On how many weekdays at least one salon is open */
export function daysOpen(branches: Branch[]) {
  return new Set(branches.flatMap((b) => openDays(b).map((h) => h.weekday))).size;
}

const same = (a: OpeningHours, b: OpeningHours) => a.closed === b.closed && a.opens === b.opens && a.closes === b.closes;
const range = (h: OpeningHours, closed: string) =>
  h.closed || !h.opens || !h.closes ? closed : `${h.opens} – ${h.closes}`;

/**
 * The week in one line: "09:00 – 20:00" when every day is the same, otherwise runs of equal days,
 * e.g. "Po–Pá 09:00 – 20:00 · So–Ne 10:00 – 18:00".
 */
export function hoursSummary(b: Branch, dayNames: string[], closed: string) {
  const week = [...b.hours].sort((x, y) => x.weekday - y.weekday);
  if (!week.length) return "";
  if (week.length === 7 && week.every((h) => same(h, week[0]))) return range(week[0], closed);
  const runs: { from: number; to: number; h: OpeningHours }[] = [];
  for (const h of week) {
    const last = runs[runs.length - 1];
    if (last && last.to === h.weekday - 1 && same(last.h, h)) last.to = h.weekday;
    else runs.push({ from: h.weekday, to: h.weekday, h });
  }
  return runs
    .map((r) => `${dayNames[r.from]}${r.to > r.from ? `–${dayNames[r.to]}` : ""} ${range(r.h, closed)}`)
    .join(" · ");
}

/** The same hours every day of the week */
export const everyDay = (opens: string, closes: string): OpeningHours[] =>
  WEEKDAYS.map((_, weekday) => ({ weekday, opens, closes, closed: false }));
