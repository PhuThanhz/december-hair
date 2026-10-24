"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { CATEGORIES, HAIR_LENGTHS, slugify, type Category, type ServiceAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";
import { DragIcon, EmptyList, FilterBar, HiddenBadge, ListHint, OrderControls, useDragOrder, useOrder } from "@/admin/collection";

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
  const [editing, setEditing] = useState<ServiceAdmin | "new" | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: services = [], error } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<ServiceAdmin[]>("/admin/services"),
    enabled: canEdit,
  });
  const order = useOrder<ServiceAdmin>("services", "/admin/services");
  const drag = useDragOrder((id, target) => order.moveTo(services, id, target));

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  const name = (s: ServiceAdmin) => (lang === "cs" ? s.nameCs : s.nameEn);
  const needle = q.trim().toLowerCase();
  const matches = (s: ServiceAdmin) => !needle || `${s.nameCs} ${s.nameEn}`.toLowerCase().includes(needle);
  const shown = CATEGORIES.filter((c) => cat === "all" || c === cat)
    .map((c) => ({ c, rows: services.filter((s) => s.category === c && matches(s)) }))
    .filter((g) => g.rows.length);

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.services.title} lead={t.cms.services.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.services.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      <FilterBar<Category>
        value={cat}
        onChange={setCat}
        options={[
          { key: "all", label: t.cms.list.all, count: services.length },
          ...CATEGORIES.map((c) => ({ key: c, label: t.cms.cats[c], count: services.filter((s) => s.category === c).length })),
        ]}
        search={q}
        onSearch={setQ}
      />
      <ListHint saving={order.saving} />

      {services.length > 0 && !shown.length && <EmptyList text={t.cms.list.noMatch} />}

      {shown.map(({ c, rows }) => (
        <section key={c} className="overflow-hidden rounded-2xl border border-ink/10 bg-white/70">
          <header className="flex items-baseline justify-between gap-4 px-4 sm:px-5 pt-4 pb-3">
            <h2 className="font-serif text-2xl">{t.cms.cats[c]}</h2>
            <span className="text-xs tabular-nums text-ink-soft">{rows.length}</span>
          </header>
          {/* Column names, so three prices read as short / medium / long */}
          <div className="hidden md:grid grid-cols-[1.25rem_minmax(0,1fr)_4.5rem_repeat(3,6rem)_7.5rem] items-center gap-x-3 border-y border-ink/10 bg-bone/40 px-5 py-2 text-[11px] uppercase tracking-wider text-ink-soft">
            <span />
            <span>{t.cms.list.service}</span>
            <span className="text-right">{t.cms.list.time}</span>
            {HAIR_LENGTHS.map((len) => (
              <span key={len} className="text-right">
                {t.cms.services.lengths[len]}
              </span>
            ))}
            <span />
          </div>
          <ul className="divide-y divide-ink/5">
            {rows.map((s, i) => (
              <li
                key={s.id}
                {...drag.itemProps(s.id)}
                className={`group grid grid-cols-[1.25rem_minmax(0,1fr)_auto] md:grid-cols-[1.25rem_minmax(0,1fr)_4.5rem_repeat(3,6rem)_7.5rem] items-center gap-x-3 px-4 sm:px-5 py-3 transition-[background-color,opacity,transform] hover:bg-bone/40 ${drag.state(s.id)} ${s.isPublished ? "" : "bg-bone/30"}`}
              >
                <DragIcon className="hidden md:block w-3 h-4 text-ink/25 cursor-grab group-hover:text-ink-soft" />
                <button type="button" onClick={() => setEditing(s)} className="min-w-0 cursor-pointer text-left md:col-start-2 col-start-1 col-span-2 md:col-span-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`font-medium group-hover:underline underline-offset-4 decoration-ink/30 ${s.isPublished ? "" : "text-ink-soft"}`}>{name(s)}</span>
                    {!s.isPublished && <HiddenBadge />}
                    {s.looks > 0 && <Badge tone="muted">{fmt(t.cms.services.usedBy, { n: String(s.looks) })}</Badge>}
                  </span>
                  {(lang === "cs" ? s.noteCs : s.noteEn) && <span className="mt-0.5 block text-xs text-ink-soft truncate">{lang === "cs" ? s.noteCs : s.noteEn}</span>}
                  {/* Phones: time and prices under the name */}
                  <span className="md:hidden mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-soft tabular-nums">
                    <span>{s.durationMin} min</span>
                    {s.lengthPrices ? (
                      HAIR_LENGTHS.map((len) => (
                        <span key={len}>
                          {t.cms.services.lengths[len]} <b className="font-medium text-ink">{czk(s.lengthPrices![len])} Kč</b>
                        </span>
                      ))
                    ) : (
                      <b className="font-medium text-ink">
                        {s.priceFrom ? `${t.cms.services.from} ` : ""}
                        {czk(s.priceCzk)} Kč
                      </b>
                    )}
                  </span>
                </button>
                <span className="hidden md:block text-right text-sm tabular-nums text-ink-soft">{s.durationMin} min</span>
                {s.lengthPrices ? (
                  HAIR_LENGTHS.map((len) => (
                    <span key={len} className="hidden md:block text-right text-sm font-medium tabular-nums">
                      {s.priceFrom && len === "short" ? <span className="mr-1 text-xs font-normal text-ink-soft">{t.cms.services.from}</span> : null}
                      {czk(s.lengthPrices![len])} Kč
                    </span>
                  ))
                ) : (
                  <span className="hidden md:flex col-span-3 items-baseline justify-end gap-2 text-sm font-medium tabular-nums">
                    <span className="text-[11px] font-normal text-ink-soft/70">{t.cms.list.onePrice}</span>
                    {s.priceFrom && <span className="text-xs font-normal text-ink-soft">{t.cms.services.from}</span>}
                    {czk(s.priceCzk)} Kč
                  </span>
                )}
                <OrderControls
                  className="justify-self-end row-start-1 col-start-3 md:col-start-auto md:row-start-auto"
                  index={i}
                  first={i === 0}
                  last={i === rows.length - 1}
                  disabled={order.saving}
                  onUp={() => order.moveTo(services, s.id, rows[i - 1].id)}
                  onDown={() => order.moveTo(services, s.id, rows[i + 1].id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {editing && <ServiceDialog service={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
