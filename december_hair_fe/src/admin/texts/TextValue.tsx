"use client";

import { useAdminT } from "../Providers";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type Path = (string | number)[];

const control =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20";

/** One string in one language: a line, or a box for longer copy */
function Line({ value, onChange, lang, label }: { value: string; onChange: (v: string) => void; lang: "cs" | "en"; label: string }) {
  const long = value.length > 70;
  return long ? (
    <textarea lang={lang} aria-label={label} rows={3} className={`${control} resize-y`} value={value} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input lang={lang} aria-label={label} className={control} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

/**
 * A text value in both languages, side by side. Strings are edited; lists and groups keep their
 * shape (the backend refuses a changed structure), so they show as fixed rows of strings.
 */
export default function TextValue({
  path,
  cs,
  en,
  onChange,
  errors,
}: {
  path: Path;
  cs: Json;
  en: Json;
  onChange: (lang: "cs" | "en", path: Path, value: string) => void;
  errors: Record<string, string>;
}) {
  const { t } = useAdminT();
  const key = path.join(".");

  if (typeof cs === "string" || typeof en === "string") {
    const enMissing = typeof en === "string" && !en.trim() && typeof cs === "string" && !!cs.trim();
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {(["cs", "en"] as const).map((l) => (
          <div key={l} className="space-y-1">
            <Line value={String(l === "cs" ? cs : en)} lang={l} label={`${key} · ${t.cms[l]}`} onChange={(v) => onChange(l, path, v)} />
            {errors[`${l}:${key}`] && <p className="text-xs text-red-700">{errors[`${l}:${key}`]}</p>}
            {l === "en" && enMissing && <p className="text-xs text-amber-800">{t.cms.texts.missingEn}</p>}
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(cs) && Array.isArray(en)) {
    return (
      <div className="space-y-2 border-l-2 border-ink/5 pl-3">
        {cs.map((item, i) => (
          <TextValue key={i} path={[...path, i]} cs={item} en={en[i] ?? ""} onChange={onChange} errors={errors} />
        ))}
      </div>
    );
  }

  if (cs && en && typeof cs === "object" && typeof en === "object") {
    const a = cs as Record<string, Json>;
    const b = en as Record<string, Json>;
    return (
      <div className="space-y-2 border-l-2 border-ink/5 pl-3">
        {Object.keys(a).map((k) => (
          <div key={k} className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-ink-soft">{k}</p>
            <TextValue path={[...path, k]} cs={a[k]} en={b[k] ?? ""} onChange={onChange} errors={errors} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-xs text-ink-soft">{JSON.stringify(cs)}</p>;
}

/** A copy of `doc` with the string at `path` replaced */
export function setAt(doc: Json, path: Path, value: string): Json {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(doc)) return doc.map((v, i) => (i === head ? setAt(v, rest, value) : v));
  const obj = (doc ?? {}) as Record<string, Json>;
  return { ...obj, [head]: setAt(obj[head as string], rest, value) };
}
