"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { BranchAdmin, WeeklyHours } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, PageHeader } from "@/admin/ui";

/** "09:00–20:00" when every day is the same, else the number of differing days */
function weekLine(hours: WeeklyHours[], closed: string) {
  const fmt = (h: WeeklyHours) => (h.closed ? closed : `${h.opens}–${h.closes}`);
  const all = new Set(hours.map(fmt));
  return all.size === 1 && hours.length === 7 ? fmt(hours[0]) : [...all].join(" / ");
}

export default function BranchesPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const isEditor = me?.role === "admin" || me?.role === "editor";
  const { data: branches = [], error } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api<BranchAdmin[]>("/admin/branches"),
    enabled: !!me,
  });

  const order = useMutation({
    mutationFn: (ids: number[]) => api("/admin/branches/order", { method: "PUT", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
  const move = (index: number, by: -1 | 1) => {
    const ids = branches.map((b) => b.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    order.mutate(ids);
  };

  if (!me) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.cms.branches.title}
        lead={isEditor ? t.cms.branches.lead : t.cms.branches.managerNote}
        actions={
          isEditor && (
            <Link href="/admin/branches/new" className="rounded-full bg-forest text-paper px-4 py-2 text-sm font-medium hover:bg-moss">
              + {t.cms.branches.add}
            </Link>
          )
        }
      />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <ul className="space-y-3">
        {branches.map((b, i) => (
          <li key={b.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-ink/10 bg-white/70 p-4">
            <div className="min-w-[14rem] flex-1">
              <p className="font-serif text-2xl leading-tight">{lang === "cs" ? b.cityCs : b.cityEn}</p>
              <p className="text-sm">{b.mall}</p>
              <p className="text-xs text-ink-soft">
                {b.street}, {b.postalCode} {b.locality} · {b.phone}
              </p>
            </div>
            <p className="text-sm tabular-nums text-ink-soft">{weekLine(b.hours, t.cms.branches.closed)}</p>
            <Badge tone={b.isPublished ? "green" : "warn"}>{b.isPublished ? t.cms.published : t.cms.hidden}</Badge>
            <div className="flex gap-1">
              {isEditor && (
                <>
                  <Button variant="ghost" aria-label={t.cms.moveUp} disabled={i === 0 || order.isPending} onClick={() => move(i, -1)}>
                    ↑
                  </Button>
                  <Button variant="ghost" aria-label={t.cms.moveDown} disabled={i === branches.length - 1 || order.isPending} onClick={() => move(i, 1)}>
                    ↓
                  </Button>
                </>
              )}
              <Link href={`/admin/branches/${b.id}`} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium hover:border-ink bg-white/60">
                {t.cms.edit}
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {!branches.length && !error && <p className="text-sm text-ink-soft">{t.cms.empty}</p>}
    </div>
  );
}
