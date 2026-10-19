"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/admin/api";
import { fmt } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Dashboard } from "@/admin/types";
import { Badge, Card, PageHeader } from "@/admin/ui";

export default function DashboardPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dashboard>("/admin/dashboard") });
  if (!me) return null;

  const tiles: [string, number | null | undefined][] = [
    [t.dash.branches, data?.branches],
    ...(me.role !== "branch_manager"
      ? ([
          [t.dash.services, data?.services],
          [t.dash.looks, data?.looks],
          [t.dash.reels, data?.reels],
        ] as [string, number | undefined][])
      : []),
    ...(me.role !== "editor"
      ? ([
          [t.dash.newBookings, data?.newBookings],
          [t.dash.newVouchers, data?.newVoucherOrders],
        ] as [string, number | undefined][])
      : []),
    ...(me.role === "admin" ? ([[t.dash.users, data?.users]] as [string, number | null | undefined][]) : []),
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={fmt(t.dash.hello, { name: me.name.split(" ")[0] })} lead={fmt(t.dash.signedInAs, { role: t.roles[me.role] })} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map(([label, n]) => (
          <Card key={label}>
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="mt-2 font-serif text-4xl tabular-nums">{n ?? "–"}</p>
          </Card>
        ))}
      </div>
      {me.role === "branch_manager" && (
        <Card>
          <p className="text-sm font-medium">{t.dash.yourBranches}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {me.branches.map((b) => (
              <Badge key={b.id} tone="green">
                {b.mall}
              </Badge>
            ))}
          </div>
        </Card>
      )}
      <p className="text-sm text-ink-soft">{t.dash.next}</p>
    </div>
  );
}
