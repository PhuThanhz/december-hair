"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { SettingsAdmin } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import type { BranchOption } from "@/admin/types";
import { Alert, Button, Field, Input, PageHeader, Select } from "@/admin/ui";
import { SaveBar, Section } from "@/admin/form-kit";

type Draft = Omit<SettingsAdmin, "notifyEmails"> & { notifyEmails: string };

function SettingsForm({ initial, branches }: { initial: SettingsAdmin; branches: BranchOption[] }) {
  const { t, lang } = useAdminT();
  const qc = useQueryClient();
  const s = t.cms.settings;
  const [d, setD] = useState<Draft>({ ...initial, notifyEmails: initial.notifyEmails.join(", ") });
  // What is saved on the server, to tell whether there is anything to save
  const [base, setBase] = useState<Draft>(d);
  const dirty = JSON.stringify(d) !== JSON.stringify(base);
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
      const next = { ...saved, notifyEmails: saved.notifyEmails.join(", ") };
      setD(next);
      setBase(next);
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
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Section title={s.social} help={t.cms.ui.sections.social}>
        {text(s.instagram, "instagramUrl", { type: "url" })}
        {text(s.facebook, "facebookUrl", { type: "url" })}
      </Section>

      <Section title={t.cms.ui.sections.bookings} help={t.cms.ui.sections.bookingsHelp}>
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
      </Section>

      <Section title={s.legal} help={t.cms.ui.sections.legal}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
          {text(s.company, "legalCompanyName")}
          {text(s.ico, "legalIco")}
        </div>
        {text(s.address, "legalAddress")}
      </Section>

      <Section title={s.vouchers} help={t.cms.ui.sections.vouchers}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {d.voucherOptions.map((o, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${o.active ? "border-moss/30 bg-celadon/30" : "border-ink/10 bg-paper/60"}`}
            >
              <Input
                type="number"
                min={1}
                aria-label={s.amount}
                className="w-28 !py-1.5"
                value={o.amountCzk}
                onChange={(e) => setOption(i, { amountCzk: Number(e.target.value) })}
              />
              <span className="text-sm text-ink-soft">Kč</span>
              <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs">
                <input type="checkbox" className="h-4 w-4 accent-moss" checked={o.active} onChange={(e) => setOption(i, { active: e.target.checked })} />
                {s.active}
              </label>
              <button
                type="button"
                aria-label={t.cms.remove}
                title={t.cms.remove}
                onClick={() => set({ voucherOptions: d.voucherOptions.filter((_, j) => j !== i) })}
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-700"
              >
                ✕
              </button>
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
        <div className="grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
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
      </Section>

      <Section title={t.cms.ui.sections.retention} help={t.cms.ui.sections.retentionHelp}>
        <Field label={s.retention} help={s.retentionHelp}>
          {(id) => <Input id={id} type="number" min={1} max={120} value={d.retentionMonths} onChange={(e) => set({ retentionMonths: Number(e.target.value) })} />}
        </Field>
      </Section>

      {save.isError && <Alert>{save.error instanceof ApiError ? save.error.message : t.somethingWrong}</Alert>}
      <SaveBar dirty={dirty} saving={save.isPending} saved={save.isSuccess} onDiscard={() => setD(base)} />
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
