"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { CATEGORIES, HAIR_LENGTHS, slugify, type Category, type ServiceAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = Omit<ServiceAdmin, "id" | "image" | "sortOrder" | "looks">;

const BLANK: Draft = {
  slug: "",
  category: "women",
  nameCs: "",
  nameEn: "",
  noteCs: "",
  noteEn: "",
  durationMin: 60,
  priceCzk: 0,
  priceFrom: false,
  lengthPrices: null,
  isPublished: true,
};

const czk = (n: number) => n.toLocaleString("cs-CZ");

function ServiceDialog({ service, onClose }: { service: ServiceAdmin | "new"; onClose: () => void }) {
  const { t } = useAdminT();
  const qc = useQueryClient();
  const isNew = service === "new";
  const [d, setD] = useState<Draft>(isNew ? BLANK : { ...service });
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? api("/admin/services", { method: "POST", body: { ...d, slug: d.slug || slugify(d.nameCs) } })
        : api(`/admin/services/${service.id}`, { method: "PATCH", body: d }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/services/${(service as ServiceAdmin).id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      onClose();
    },
  });
  const error = save.error ?? remove.error;

  return (
    <Dialog open title={isNew ? t.cms.services.add : t.cms.edit} onClose={onClose} closeLabel={t.close}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t.cms.services.name} · ${t.cms.cs}`}>
            {(id) => <Input id={id} required value={d.nameCs} onChange={(e) => set({ nameCs: e.target.value })} />}
          </Field>
          <Field label={`${t.cms.services.name} · ${t.cms.en}`}>
            {(id) => <Input id={id} required value={d.nameEn} onChange={(e) => set({ nameEn: e.target.value })} />}
          </Field>
          <Field label={`${t.cms.services.note} · ${t.cms.cs}`}>
            {(id) => <Input id={id} value={d.noteCs} onChange={(e) => set({ noteCs: e.target.value })} />}
          </Field>
          <Field label={`${t.cms.services.note} · ${t.cms.en}`}>
            {(id) => <Input id={id} value={d.noteEn} onChange={(e) => set({ noteEn: e.target.value })} />}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t.cms.category}>
            {(id) => (
              <Select id={id} value={d.category} onChange={(e) => set({ category: e.target.value as Category })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t.cms.cats[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.cms.services.duration}>
            {(id) => (
              <Input id={id} type="number" min={1} required value={d.durationMin} onChange={(e) => set({ durationMin: Number(e.target.value) })} />
            )}
          </Field>
          {!d.lengthPrices && (
            <Field label={t.cms.services.price}>
              {(id) => (
                <Input id={id} type="number" min={0} required value={d.priceCzk} onChange={(e) => set({ priceCzk: Number(e.target.value) })} />
              )}
            </Field>
          )}
        </div>
        <Checkbox
          label={t.cms.services.byLength}
          checked={!!d.lengthPrices}
          onChange={(e) =>
            set({ lengthPrices: e.target.checked ? { short: d.priceCzk, medium: d.priceCzk, long: d.priceCzk } : null })
          }
        />
        {d.lengthPrices && (
          <div className="grid gap-4 sm:grid-cols-3">
            {HAIR_LENGTHS.map((len) => (
              <Field key={len} label={`${t.cms.services.lengths[len]} · ${t.cms.services.price}`}>
                {(id) => (
                  <Input
                    id={id}
                    type="number"
                    min={0}
                    required
                    value={d.lengthPrices![len]}
                    onChange={(e) => set({ lengthPrices: { ...d.lengthPrices!, [len]: Number(e.target.value) } })}
                  />
                )}
              </Field>
            ))}
          </div>
        )}
        <Checkbox label={t.cms.services.priceFrom} checked={d.priceFrom} onChange={(e) => set({ priceFrom: e.target.checked })} />
        <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
        {isNew && (
          <Field label={t.cms.slug} help={t.cms.slugHelp}>
            {(id) => (
              <Input id={id} placeholder={slugify(d.nameCs)} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />
            )}
          </Field>
        )}
        {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!isNew ? (
            <Button
              type="button"
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: service.nameCs })) && remove.mutate()}
            >
              {t.cms.delete}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default function ServicesPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ServiceAdmin | "new" | null>(null);
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: services = [], error } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<ServiceAdmin[]>("/admin/services"),
    enabled: canEdit,
  });

  const order = useMutation({
    mutationFn: (ids: number[]) => api("/admin/services/order", { method: "PUT", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
  const move = (index: number, by: -1 | 1) => {
    const ids = services.map((s) => s.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    order.mutate(ids);
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.services.title} lead={t.cms.services.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.services.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      {CATEGORIES.map((cat) => {
        const rows = services.map((s, i) => ({ s, i })).filter(({ s }) => s.category === cat);
        if (!rows.length) return null;
        return (
          <section key={cat} className="rounded-2xl border border-ink/10 bg-white/70">
            <h2 className="px-4 pt-4 pb-2 font-serif text-xl">{t.cms.cats[cat]}</h2>
            <ul className="divide-y divide-ink/5">
              {rows.map(({ s, i }) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <div className="min-w-[12rem] flex-1">
                    <p className="font-medium">{lang === "cs" ? s.nameCs : s.nameEn}</p>
                    <p className="text-xs text-ink-soft truncate">{lang === "cs" ? s.noteCs : s.noteEn}</p>
                  </div>
                  <span className="tabular-nums text-ink-soft">{s.durationMin} min</span>
                  <span className="tabular-nums font-medium text-right min-w-24">
                    {s.priceFrom ? `${t.cms.services.from} ` : ""}
                    {s.lengthPrices ? HAIR_LENGTHS.map((len) => czk(s.lengthPrices![len])).join(" / ") : czk(s.priceCzk)} Kč
                  </span>
                  <Badge tone={s.isPublished ? "green" : "muted"}>{s.isPublished ? t.cms.published : t.cms.hidden}</Badge>
                  {s.looks > 0 && <span className="text-xs text-ink-soft">{fmt(t.cms.services.usedBy, { n: String(s.looks) })}</span>}
                  <span className="flex gap-1">
                    <Button variant="ghost" aria-label={t.cms.moveUp} disabled={i === 0 || order.isPending} onClick={() => move(i, -1)}>
                      ↑
                    </Button>
                    <Button variant="ghost" aria-label={t.cms.moveDown} disabled={i === services.length - 1 || order.isPending} onClick={() => move(i, 1)}>
                      ↓
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(s)}>
                      {t.cms.edit}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {editing && <ServiceDialog service={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
