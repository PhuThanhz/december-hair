"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { SettingsAdmin } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import type { BranchOption } from "@/admin/types";
import { Alert, Button, Card, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = Omit<SettingsAdmin, "notifyEmails"> & { notifyEmails: string };

function SettingsForm({ initial, branches }: { initial: SettingsAdmin; branches: BranchOption[] }) {
  const { t, lang } = useAdminT();
  const qc = useQueryClient();
  const s = t.cms.settings;
  const [d, setD] = useState<Draft>({ ...initial, notifyEmails: initial.notifyEmails.join(", ") });
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const amounts = d.voucherOptions.map((o) => o.amountCzk);

  const save = useMutation({
    mutationFn: () =>
      api<SettingsAdmin>("/admin/settings", {
        method: "PATCH",
        body: {
          ...d,
          notifyEmails: d.notifyEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
          voucherDefaultAmount: amounts.includes(d.voucherDefaultAmount ?? -1) ? d.voucherDefaultAmount : null,
        },
      }),
    onSuccess: (saved) => {
      qc.setQueryData(["settings"], saved);
      setD({ ...saved, notifyEmails: saved.notifyEmails.join(", ") });
    },
  });

  const text = (label: string, key: keyof Draft, opts: { help?: string; type?: string } = {}) => (
    <Field label={label} help={opts.help}>
      {(id) => <Input id={id} type={opts.type} value={String(d[key] ?? "")} onChange={(e) => set({ [key]: e.target.value } as Partial<Draft>)} />}
    </Field>
  );
  const setOption = (i: number, patch: Partial<Draft["voucherOptions"][number]>) =>
    set({ voucherOptions: d.voucherOptions.map((o, j) => (j === i ? { ...o, ...patch } : o)) });

  return (
    <form
      className="space-y-6 max-w-3xl"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Card className="space-y-4">
        <h2 className="font-serif text-xl">{s.social}</h2>
        {text(s.instagram, "instagramUrl", { type: "url" })}
        {text(s.facebook, "facebookUrl", { type: "url" })}
      </Card>

      <Card className="space-y-4">
        <Field label={s.defaultBranch} help={s.defaultBranchHelp}>
          {(id) => (
            <Select id={id} value={d.defaultBranchId ?? ""} onChange={(e) => set({ defaultBranchId: Number(e.target.value) || null })}>
              <option value="">—</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {lang === "cs" ? b.cityCs : b.cityEn} — {b.mall}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text(s.notify, "notifyEmails", { help: s.notifyHelp })}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-serif text-xl">{s.legal}</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          {text(s.company, "legalCompanyName")}
          {text(s.ico, "legalIco")}
        </div>
        {text(s.address, "legalAddress")}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-serif text-xl">{s.vouchers}</h2>
        <ul className="space-y-2">
          {d.voucherOptions.map((o, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3">
              <Input
                type="number"
                min={1}
                aria-label={s.amount}
                className="w-36"
                value={o.amountCzk}
                onChange={(e) => setOption(i, { amountCzk: Number(e.target.value) })}
              />
              <span className="text-sm text-ink-soft">Kč</span>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-moss" checked={o.active} onChange={(e) => setOption(i, { active: e.target.checked })} />
                {s.active}
              </label>
              <Button type="button" variant="ghost" onClick={() => set({ voucherOptions: d.voucherOptions.filter((_, j) => j !== i) })}>
                {t.cms.remove}
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="secondary"
          disabled={d.voucherOptions.length >= 6}
          onClick={() => set({ voucherOptions: [...d.voucherOptions, { amountCzk: 500, active: true }] })}
        >
          + {s.addAmount}
        </Button>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={s.defaultAmount}>
            {(id) => (
              <Select id={id} value={d.voucherDefaultAmount ?? ""} onChange={(e) => set({ voucherDefaultAmount: Number(e.target.value) || null })}>
                <option value="">—</option>
                {amounts.map((a) => (
                  <option key={a} value={a}>
                    {a.toLocaleString("cs-CZ")} Kč
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={s.validity}>
            {(id) => (
              <Input id={id} type="number" min={1} max={60} value={d.voucherValidityMonths} onChange={(e) => set({ voucherValidityMonths: Number(e.target.value) })} />
            )}
          </Field>
        </div>
      </Card>

      <Card>
        <Field label={s.retention} help={s.retentionHelp}>
          {(id) => <Input id={id} type="number" min={1} max={120} value={d.retentionMonths} onChange={(e) => set({ retentionMonths: Number(e.target.value) })} />}
        </Field>
      </Card>

      {save.isError && <Alert>{save.error instanceof ApiError ? save.error.message : t.somethingWrong}</Alert>}
      {save.isSuccess && <Alert tone="success">{t.cms.savedSite}</Alert>}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? t.saving : t.save}
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const isAdmin = me?.role === "admin";
  const { data, error } = useQuery({ queryKey: ["settings"], queryFn: () => api<SettingsAdmin>("/admin/settings"), enabled: isAdmin });
  const { data: branches = [] } = useQuery({
    queryKey: ["branch-options"],
    queryFn: () => api<BranchOption[]>("/admin/branches/options"),
    enabled: isAdmin,
  });

  if (!me) return null;
  if (!isAdmin) return <Alert>{t.notAllowed}</Alert>;
  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.settings.title} lead={t.cms.settings.lead} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {data && <SettingsForm initial={data} branches={branches} />}
    </div>
  );
}
