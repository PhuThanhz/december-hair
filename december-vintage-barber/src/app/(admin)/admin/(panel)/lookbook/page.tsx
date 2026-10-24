"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { CATEGORIES, slugify, type Category, type LookAdmin, type MediaRef, type ServiceAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import MediaPicker, { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { EmptyList, FilterBar, HiddenBadge, ListHint, OrderControls, useDragOrder, useOrder } from "@/admin/collection";
import { Alert, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = {
  slug: string;
  image: MediaRef | null;
  titleCs: string;
  titleEn: string;
  serviceId: number | "";
  category: Category;
  isPublished: boolean;
};

function LookDialog({ look, services, onClose }: { look: LookAdmin | "new"; services: ServiceAdmin[]; onClose: () => void }) {
  const { t, lang } = useAdminT();
  const qc = useQueryClient();
  const isNew = look === "new";
  const [d, setD] = useState<Draft>(
    isNew
      ? { slug: "", image: null, titleCs: "", titleEn: "", serviceId: "", category: "women", isPublished: true }
      : { ...look, image: look.image }
  );
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const done = () => {
    qc.invalidateQueries({ queryKey: ["looks"] });
    qc.invalidateQueries({ queryKey: ["services"] });
    onClose();
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        imageId: d.image?.id,
        titleCs: d.titleCs,
        titleEn: d.titleEn,
        serviceId: d.serviceId || undefined,
        category: d.category,
        isPublished: d.isPublished,
      };
      return isNew
        ? api("/admin/looks", { method: "POST", body: { ...body, slug: d.slug || slugify(d.titleCs) } })
        : api(`/admin/looks/${look.id}`, { method: "PATCH", body });
    },
    onSuccess: done,
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/looks/${(look as LookAdmin).id}`, { method: "DELETE" }),
    onSuccess: done,
  });
  const error = save.error ?? remove.error;

  return (
    <Dialog open title={isNew ? t.cms.looks.add : t.cms.edit} onClose={onClose} closeLabel={t.close}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <MediaPicker label={t.cms.image} kind="image" value={d.image} onChange={(m) => set({ image: m })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t.cms.looks.titleField} · ${t.cms.cs}`}>
            {(id) => <Input id={id} required value={d.titleCs} onChange={(e) => set({ titleCs: e.target.value })} />}
          </Field>
          <Field label={`${t.cms.looks.titleField} · ${t.cms.en}`}>
            {(id) => <Input id={id} required value={d.titleEn} onChange={(e) => set({ titleEn: e.target.value })} />}
          </Field>
          <Field label={t.cms.looks.service}>
            {(id) => (
              <Select id={id} required value={d.serviceId} onChange={(e) => set({ serviceId: Number(e.target.value) || "" })}>
                <option value="">—</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "cs" ? s.nameCs : s.nameEn} · {s.priceCzk.toLocaleString("cs-CZ")} Kč
                  </option>
                ))}
              </Select>
            )}
          </Field>
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
        </div>
        <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
        {isNew && (
          <Field label={t.cms.slug} help={t.cms.slugHelp}>
            {(id) => <Input id={id} placeholder={slugify(d.titleCs)} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />}
          </Field>
        )}
        {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!isNew ? (
            <Button
              type="button"
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: look.titleCs })) && remove.mutate()}
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
            <Button type="submit" disabled={save.isPending || !d.image}>
              {save.isPending ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default function LookbookPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const [editing, setEditing] = useState<LookAdmin | "new" | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: looks = [], error } = useQuery({ queryKey: ["looks"], queryFn: () => api<LookAdmin[]>("/admin/looks"), enabled: canEdit });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => api<ServiceAdmin[]>("/admin/services"), enabled: canEdit });
  const order = useOrder<LookAdmin>("looks", "/admin/looks");
  const drag = useDragOrder((id, target) => order.moveTo(looks, id, target));
  const serviceName = (id: number) => {
    const s = services.find((x) => x.id === id);
    return s ? (lang === "cs" ? s.nameCs : s.nameEn) : "";
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;
  const rows = looks.filter((l) => cat === "all" || l.category === cat);

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.looks.title} lead={t.cms.looks.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.looks.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <FilterBar<Category>
        value={cat}
        onChange={setCat}
        options={[
          { key: "all", label: t.cms.list.all, count: looks.length },
          ...CATEGORIES.map((c) => ({ key: c, label: t.cms.cats[c], count: looks.filter((l) => l.category === c).length })),
        ]}
      />
      <ListHint saving={order.saving} />
      {looks.length > 0 && !rows.length && <EmptyList text={t.cms.list.noMatch} />}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {rows.map((l, i) => (
          <li
            key={l.id}
            {...drag.itemProps(l.id)}
            className={`group flex flex-col rounded-2xl border border-ink/10 bg-white/70 p-2 transition-[opacity,transform,box-shadow] hover:shadow-[0_12px_30px_-18px_rgba(17,38,26,0.5)] ${drag.state(l.id)}`}
          >
            <button type="button" onClick={() => setEditing(l)} aria-label={`${t.cms.edit}: ${lang === "cs" ? l.titleCs : l.titleEn}`} className="relative block cursor-pointer overflow-hidden rounded-xl">
              <MediaThumb
                media={l.image}
                className={`w-full aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.04] ${l.isPublished ? "" : "grayscale opacity-60"}`}
              />
              {!l.isPublished && <HiddenBadge className="absolute left-2 top-2" />}
              <span className="absolute right-2 top-2 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
                {t.cms.edit}
              </span>
            </button>
            <div className="flex items-start justify-between gap-2 px-1 pt-2.5 pb-2">
              <div className="min-w-0">
                <p className="font-medium leading-snug truncate">{lang === "cs" ? l.titleCs : l.titleEn}</p>
                <p className="mt-0.5 text-xs text-ink-soft truncate">
                  {t.cms.cats[l.category]} · {serviceName(l.serviceId)}
                </p>
              </div>
            </div>
            <OrderControls
              className="mx-1 mb-1 mt-auto self-start"
              index={i}
              first={i === 0}
              last={i === rows.length - 1}
              disabled={order.saving}
              onUp={() => order.moveTo(looks, l.id, rows[i - 1].id)}
              onDown={() => order.moveTo(looks, l.id, rows[i + 1].id)}
            />
          </li>
        ))}
      </ul>
      {editing && <LookDialog look={editing} services={services} onClose={() => setEditing(null)} />}
    </div>
  );
}
