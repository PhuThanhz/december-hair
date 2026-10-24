import type { Branch, Lang } from "@/content/types";

/** Plural by count: Czech 1 / 2–4 / 5+ (and 0), English 1 / everything else */
export function plural(lang: Lang, n: number, [one, few, many]: readonly string[]) {
  if (n === 1) return one;
  if (lang === "cs") return n >= 2 && n <= 4 ? few : many;
  return few;
}

/** Fill {name} placeholders; unknown ones stay as they are for a later fill */
export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Fill placeholders in every string of a (nested) dictionary, keeping its shape */
export function fillAll<T>(value: T, vars: Record<string, string | number>): T {
  if (typeof value === "string") return fill(value, vars) as T;
  if (Array.isArray(value)) return value.map((v) => fillAll(v, vars)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillAll(v, vars)])) as T;
  }
  return value;
}

const NUMBER_WORDS: Record<Lang, string[]> = {
  cs: ["žádný", "jeden", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět", "deset"],
  en: ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
};

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Everything the texts say about the salons themselves, so adding or hiding a branch updates them:
 *   {count} 3 · {countWord} tři · {CountWord} Tři · {salons} salony
 *   {cities} Praha · Kladno · Mladá Boleslav · {citiesDash} Praha — Kladno — …
 *   {citiesList} Praha, Kladno a Mladá Boleslav
 */
export function branchVars(branches: Branch[], lang: Lang, salonForms: readonly string[], and: string) {
  const n = branches.length;
  const cities = branches.map((b) => b.city[lang]);
  const word = NUMBER_WORDS[lang][n] ?? String(n);
  return {
    count: n,
    countWord: word,
    CountWord: capital(word),
    salons: plural(lang, n, salonForms),
    cities: cities.join(" · "),
    citiesDash: cities.join(" — "),
    citiesList: cities.length > 1 ? `${cities.slice(0, -1).join(", ")} ${and} ${cities[cities.length - 1]}` : (cities[0] ?? ""),
  };
}
