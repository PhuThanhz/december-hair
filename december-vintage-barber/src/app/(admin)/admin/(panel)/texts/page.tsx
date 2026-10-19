"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { T } from "@/app/data";
import { api, ApiError } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import TextValue, { setAt, type Json, type Path } from "@/admin/texts/TextValue";
import { Alert, Button, Input, PageHeader } from "@/admin/ui";

type Texts = { cs: Record<string, Json>; en: Record<string, Json> };

// Which part of the page a text key belongs to (first match wins)
const SECTIONS: [string, RegExp][] = [
  ["hero", /^hero/],
  ["about", /^about/],
  ["services", /^services/],
  ["prices", /^(prices|receipt|cat$)/],
  ["reels", /^(reels|sound|prev|next|goToVideo)/],
  ["look", /^look/],
  ["voucher", /^(vouchers|v[A-Z])/],
  ["branches", /^(branches|map|marquee)/],
  ["footer", /^(social|follow|fbOfficial|footerRights)/],
  ["booking", /^(modal|form)/],
  ["nav", /^(nav|book$|menu|close$|closed$|introLine|salonForms|listAnd)/],
];
const ORDER = ["nav", "hero", "about", "services", "prices", "reels", "look", "voucher", "branches", "footer", "booking", "other"];
const sectionOf = (key: string) => SECTIONS.find(([, re]) => re.test(key))?.[0] ?? "other";

// The database (JSONB) keeps keys in its own order; show them in the order the site's
// dictionary declares them, unknown ones last
const REFERENCE = Object.keys(T.cs);
const rank = (k: string) => (REFERENCE.includes(k) ? REFERENCE.indexOf(k) : REFERENCE.length);

/** Does a value (or anything inside it) contain `q`? */
const contains = (v: Json, q: string): boolean =>
  typeof v === "string" ? v.toLowerCase().includes(q) : Array.isArray(v) ? v.some((x) => contains(x, q)) : !!v && typeof v === "object" && Object.values(v).some((x) => contains(x, q));

/** 422 items { loc: ["body", ...path], msg, type } → "cs:path.to.key" → message in the admin's language */
function fieldErrors(lang: "cs" | "en", err: unknown, words: Record<string, string>): Record<string, string> {
  if (!(err instanceof ApiError) || !Array.isArray(err.detail)) return {};
  return Object.fromEntries(
    (err.detail as { loc?: (string | number)[]; msg?: string; type?: string }[]).map((d) => [
      `${lang}:${(d.loc ?? []).filter((p) => p !== "body").join(".")}`,
      (d.type && words[d.type]) || d.msg || "",
    ])
  );
}

function Editor({ initial }: { initial: Texts }) {
  const { t } = useAdminT();
  // What the server has: changes are measured against it, and it moves forward on each save
  const [baseline, setBaseline] = useState<Texts>(initial);
  const [draft, setDraft] = useState<Texts>(initial);
  const [q, setQ] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const changed = (["cs", "en"] as const).filter((l) => JSON.stringify(draft[l]) !== JSON.stringify(baseline[l]));
  const onChange = (lang: "cs" | "en", path: Path, value: string) => {
    setDraft((d) => ({ ...d, [lang]: setAt(d[lang], path, value) as Record<string, Json> }));
    setStatus("idle");
  };

  const save = async () => {
    setStatus("saving");
    setErrors({});
    setMessage(null);
    const found: Record<string, string> = {};
    for (const lang of changed) {
      try {
        await api(`/admin/texts/${lang}`, { method: "PUT", body: draft[lang] });
        setBaseline((b) => ({ ...b, [lang]: draft[lang] }));
      } catch (e) {
        Object.assign(found, fieldErrors(lang, e, t.cms.texts.errors));
        if (!Object.keys(found).length) setMessage(e instanceof ApiError ? e.message : t.somethingWrong);
      }
    }
    setErrors(found);
    const failed = Object.keys(found).length > 0;
    setStatus(failed ? "error" : "saved");
    if (failed) setMessage(Object.values(found)[0]);
  };

  const keys = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return Object.keys(draft.cs)
      .filter((k) => !needle || k.toLowerCase().includes(needle) || contains(draft.cs[k], needle) || contains(draft.en[k], needle))
      .sort((a, b) => rank(a) - rank(b));
  }, [draft, q]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-3 border-b border-ink/10 bg-paper/95 px-1 py-3 backdrop-blur">
        <Input type="search" placeholder={t.cms.texts.search} aria-label={t.cms.texts.search} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <span className="flex-1 text-xs text-ink-soft">{t.cms.texts.structureHelp}</span>
        <Button onClick={save} disabled={!changed.length || status === "saving"}>
          {status === "saving" ? t.saving : t.cms.texts.save}
        </Button>
      </div>
      {status === "saved" && <Alert tone="success">{t.cms.savedSite}</Alert>}
      {message && <Alert>{message}</Alert>}

      {ORDER.map((section) => {
        const rows = keys.filter((k) => sectionOf(k) === section);
        if (!rows.length) return null;
        return (
          <details key={section} open={!!q || section === "nav"} className="rounded-2xl border border-ink/10 bg-white/70">
            <summary className="cursor-pointer px-4 py-3 font-serif text-xl">{t.cms.texts.sections[section]}</summary>
            <div className="divide-y divide-ink/5 px-4 pb-4">
              {rows.map((k) => (
                <div key={k} className="space-y-1.5 py-3">
                  <p className="font-mono text-xs text-ink-soft">{k}</p>
                  <TextValue path={[k]} cs={draft.cs[k]} en={draft.en[k] ?? ""} onChange={onChange} errors={errors} />
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default function TextsPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data, error } = useQuery({
    queryKey: ["texts"],
    queryFn: () => api<Texts>("/admin/texts"),
    enabled: canEdit,
    // The editor holds its own copy: a background refetch must not wipe what is being typed
    staleTime: Infinity,
  });

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;
  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.texts.title} lead={t.cms.texts.lead} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {data && <Editor initial={data} />}
    </div>
  );
}
