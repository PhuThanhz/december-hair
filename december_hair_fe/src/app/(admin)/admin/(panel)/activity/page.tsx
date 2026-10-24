"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { AuditEntry } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Button, PageHeader } from "@/admin/ui";
import { EmptyList, FilterBar } from "@/admin/collection";

const ENTITIES = ["branch", "service", "look", "reel", "panel", "texts", "site_media", "page", "media", "settings", "user"];

/** "price_czk: 490 → 555", or the field names for longer changes */
function summary(changes: Record<string, unknown>) {
  return Object.entries(changes)
    .slice(0, 4)
    .map(([k, v]) => (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x !== "object") ? `${k}: ${String(v[0])} → ${String(v[1])}` : k))
    .join(" · ");
}

export default function ActivityPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const [entity, setEntity] = useState("");
  const [limit, setLimit] = useState(50);
  // The day the page was opened, for "Today" and "Yesterday"
  const [now] = useState(() => Date.now());
  const isAdmin = me?.role === "admin";
  const { data: rows = [], error, isFetching } = useQuery({
    queryKey: ["audit", entity, limit],
    queryFn: () => api<AuditEntry[]>(`/admin/audit?limit=${limit}${entity ? `&entity=${entity}` : ""}`),
    enabled: isAdmin,
  });

  if (!me) return null;
  if (!isAdmin) return <Alert>{t.notAllowed}</Alert>;
  const a = t.cms.activity;
  const log = t.cms.ui.log;

  // Newest first, grouped by day ("Today", "Yesterday", then the date)
  const dayKey = (iso: string) => new Date(iso).toDateString();
  const today = new Date(now);
  const yesterday = new Date(now - 864e5);
  const dayLabel = (iso: string) => {
    const k = dayKey(iso);
    if (k === today.toDateString()) return log.today;
    if (k === yesterday.toDateString()) return log.yesterday;
    return new Date(iso).toLocaleDateString(lang === "cs" ? "cs-CZ" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  const days: { label: string; rows: AuditEntry[] }[] = [];
  for (const r of rows) {
    const label = dayLabel(r.createdAt);
    if (days.at(-1)?.label === label) days.at(-1)!.rows.push(r);
    else days.push({ label, rows: [r] });
  }
  const time = (iso: string) => new Date(iso).toLocaleTimeString(lang === "cs" ? "cs-CZ" : "en-GB", { hour: "2-digit", minute: "2-digit" });
  const tone: Record<string, string> = {
    create: "bg-moss text-paper",
    upload: "bg-moss text-paper",
    delete: "bg-red-700 text-white",
    update: "bg-forest text-paper",
    reorder: "bg-bone text-ink",
  };

  return (
    <div className="space-y-6">
      <PageHeader title={a.title} lead={a.lead} />
      <FilterBar<string>
        value={entity || "all"}
        onChange={(e) => setEntity(e === "all" ? "" : e)}
        options={[{ key: "all", label: t.cms.media.all }, ...ENTITIES.map((e) => ({ key: e, label: log.entities[e] ?? e }))]}
      />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      {days.map((d) => (
        <section key={d.label}>
          <h2 className="label mb-3 text-ink-soft first-letter:uppercase">{d.label}</h2>
          <ol className="relative space-y-1 border-l border-ink/10 pl-6">
            {d.rows.map((r) => (
              <li key={r.id} className="relative rounded-xl px-3 py-2.5 hover:bg-white/70">
                <span
                  className={`absolute -left-[2.05rem] top-3 grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold uppercase ring-4 ring-paper ${tone[r.action] ?? "bg-bone text-ink"}`}
                  aria-hidden
                >
                  {r.action.slice(0, 1)}
                </span>
                <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                  <span className="font-medium">{r.userName ?? "—"}</span>
                  <span className="text-ink-soft">{log.actions[r.action] ?? r.action}</span>
                  <span className="font-medium">{log.entities[r.entity] ?? r.entity}</span>
                  {r.entityId && <span className="text-xs text-ink-soft">#{r.entityId}</span>}
                  <span className="ml-auto text-xs tabular-nums text-ink-soft">{time(r.createdAt)}</span>
                </p>
                {r.action !== "reorder" && Object.keys(r.changes).length > 0 && (
                  <p className="mt-1 text-xs text-ink-soft break-words">{summary(r.changes)}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
      {!rows.length && !error && <EmptyList text={t.cms.empty} />}
      {rows.length === limit && limit < 200 && (
        <Button variant="secondary" disabled={isFetching} onClick={() => setLimit((l) => Math.min(200, l + 50))}>
          {isFetching ? t.loading : log.more}
        </Button>
      )}
    </div>
  );
}
