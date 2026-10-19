"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { AuditEntry } from "@/admin/cms";
import { formatDate } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, PageHeader, Select } from "@/admin/ui";

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
  const isAdmin = me?.role === "admin";
  const { data: rows = [], error, isFetching } = useQuery({
    queryKey: ["audit", entity, limit],
    queryFn: () => api<AuditEntry[]>(`/admin/audit?limit=${limit}${entity ? `&entity=${entity}` : ""}`),
    enabled: isAdmin,
  });

  if (!me) return null;
  if (!isAdmin) return <Alert>{t.notAllowed}</Alert>;
  const a = t.cms.activity;

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.title}
        lead={a.lead}
        actions={
          <Select aria-label={a.what} value={entity} onChange={(e) => setEntity(e.target.value)} className="w-48">
            <option value="">{t.cms.media.all}</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        }
      />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink-soft border-b border-ink/10">
            <tr>
              <th className="px-4 py-3 font-medium">{a.when}</th>
              <th className="px-4 py-3 font-medium">{a.who}</th>
              <th className="px-4 py-3 font-medium">{a.what}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-ink-soft">{formatDate(r.createdAt, lang, t.never)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.userName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge tone={r.action === "delete" ? "warn" : r.action === "create" || r.action === "upload" ? "green" : "neutral"}>{r.action}</Badge>
                    <span className="font-medium">{r.entity}</span>
                    {r.entityId && <span className="text-xs text-ink-soft">#{r.entityId}</span>}
                  </span>
                  {Object.keys(r.changes).length > 0 && <p className="mt-1 text-xs text-ink-soft break-words">{summary(r.changes)}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && !error && <p className="text-sm text-ink-soft">{t.cms.empty}</p>}
      {rows.length === limit && limit < 200 && (
        <Button variant="secondary" disabled={isFetching} onClick={() => setLimit((l) => Math.min(200, l + 50))}>
          {isFetching ? t.loading : "+ 50"}
        </Button>
      )}
    </div>
  );
}
