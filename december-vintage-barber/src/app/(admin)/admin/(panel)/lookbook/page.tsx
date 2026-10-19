"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { CATEGORIES, slugify, type Category, type LookAdmin, type MediaRef, type ServiceAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import MediaPicker, { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

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
  const qc = useQueryClient();
  const [editing, setEditing] = useState<LookAdmin | "new" | null>(null);
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: looks = [], error } = useQuery({ queryKey: ["looks"], queryFn: () => api<LookAdmin[]>("/admin/looks"), enabled: canEdit });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => api<ServiceAdmin[]>("/admin/services"), enabled: canEdit });
  const serviceName = (id: number) => {
    const s = services.find((x) => x.id === id);
    return s ? (lang === "cs" ? s.nameCs : s.nameEn) : "";
  };

  const order = useMutation({
    mutationFn: (ids: number[]) => api("/admin/looks/order", { method: "PUT", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["looks"] }),
  });
  const move = (index: number, by: -1 | 1) => {
    const ids = looks.map((l) => l.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    order.mutate(ids);
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.looks.title} lead={t.cms.looks.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.looks.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {looks.map((l, i) => (
          <li key={l.id} className="flex gap-3 rounded-2xl border border-ink/10 bg-white/70 p-3">
            <MediaThumb media={l.image} className="h-24 w-24 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium truncate">{lang === "cs" ? l.titleCs : l.titleEn}</p>
              <p className="text-xs text-ink-soft truncate">
                {t.cms.cats[l.category]} · {serviceName(l.serviceId)}
              </p>
              <Badge tone={l.isPublished ? "green" : "muted"}>{l.isPublished ? t.cms.published : t.cms.hidden}</Badge>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" aria-label={t.cms.moveUp} disabled={i === 0 || order.isPending} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" aria-label={t.cms.moveDown} disabled={i === looks.length - 1 || order.isPending} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <Button variant="secondary" onClick={() => setEditing(l)}>
                  {t.cms.edit}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editing && <LookDialog look={editing} services={services} onClose={() => setEditing(null)} />}
    </div>
  );
}
