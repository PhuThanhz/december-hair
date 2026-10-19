"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { CATEGORIES, slugify, type Category, type MediaRef, type PanelAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import MediaPicker from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = {
  slug: string;
  image: MediaRef | null;
  focus: string;
  bookingCategory: Category | null;
  nameCs: string;
  nameEn: string;
  lineCs: string;
  lineEn: string;
  tagsCs: string;
  tagsEn: string;
  isPublished: boolean;
};

const tags = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);

/** The photo in a narrow mirror, cropped the way the site crops it */
function FocusPreview({ image, focus }: { image: MediaRef | null; focus: string }) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small library thumbnail
    <img src={image.url} alt="" className="h-40 w-16 rounded-lg object-cover bg-bone" style={{ objectPosition: focus }} />
  );
}

function PanelDialog({ panel, onClose }: { panel: PanelAdmin | "new"; onClose: () => void }) {
  const { t } = useAdminT();
  const qc = useQueryClient();
  const isNew = panel === "new";
  const [d, setD] = useState<Draft>(
    isNew
      ? { slug: "", image: null, focus: "50% 50%", bookingCategory: null, nameCs: "", nameEn: "", lineCs: "", lineEn: "", tagsCs: "", tagsEn: "", isPublished: true }
      : { ...panel, tagsCs: panel.tagsCs.join(", "), tagsEn: panel.tagsEn.join(", ") }
  );
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const done = () => {
    qc.invalidateQueries({ queryKey: ["panels"] });
    onClose();
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        imageId: d.image?.id ?? null,
        focus: d.focus,
        bookingCategory: d.bookingCategory,
        nameCs: d.nameCs,
        nameEn: d.nameEn,
        lineCs: d.lineCs,
        lineEn: d.lineEn,
        tagsCs: tags(d.tagsCs),
        tagsEn: tags(d.tagsEn),
        isPublished: d.isPublished,
      };
      return isNew
        ? api("/admin/panels", { method: "POST", body: { ...body, slug: d.slug || slugify(d.nameCs) } })
        : api(`/admin/panels/${panel.id}`, { method: "PATCH", body });
    },
    onSuccess: done,
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/panels/${(panel as PanelAdmin).id}`, { method: "DELETE" }),
    onSuccess: done,
  });
  const error = save.error ?? remove.error;
  const text = (label: string, prefix: "name" | "line" | "tags", required = false) =>
    (["cs", "en"] as const).map((l) => {
      const k = `${prefix}${l === "cs" ? "Cs" : "En"}` as const;
      return (
        <Field key={k} label={`${label} · ${t.cms[l]}`}>
          {(id) => <Input id={id} required={required} value={d[k]} onChange={(e) => set({ [k]: e.target.value })} />}
        </Field>
      );
    });

  return (
    <Dialog open title={isNew ? t.cms.panels.add : t.cms.edit} onClose={onClose} closeLabel={t.close}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <MediaPicker label={t.cms.image} kind="image" value={d.image} allowNone onChange={(m) => set({ image: m })} />
          </div>
          <FocusPreview image={d.image} focus={d.focus} />
        </div>
        <Field label={t.cms.panels.focus} help={t.cms.panels.focusHelp}>
          {(id) => <Input id={id} pattern="\d{1,3}% \d{1,3}%" required value={d.focus} onChange={(e) => set({ focus: e.target.value })} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {text(t.cms.panels.name, "name", true)}
          {text(t.cms.panels.line, "line")}
          {text(t.cms.panels.tags, "tags")}
        </div>
        <p className="-mt-3 text-xs text-ink-soft">{t.cms.panels.tagsHelp}</p>
        <Field label={t.cms.panels.booking}>
          {(id) => (
            <Select id={id} value={d.bookingCategory ?? ""} onChange={(e) => set({ bookingCategory: (e.target.value || null) as Category | null })}>
              <option value="">{t.cms.panels.bookingNone}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t.cms.cats[c]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
        {isNew && (
          <Field label={t.cms.slug} help={t.cms.slugHelp}>
            {(id) => <Input id={id} placeholder={slugify(d.nameCs)} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />}
          </Field>
        )}
        {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!isNew ? (
            <Button
              type="button"
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: panel.nameCs })) && remove.mutate()}
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

export default function PanelsPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PanelAdmin | "new" | null>(null);
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: panels = [], error } = useQuery({ queryKey: ["panels"], queryFn: () => api<PanelAdmin[]>("/admin/panels"), enabled: canEdit });

  const order = useMutation({
    mutationFn: (ids: number[]) => api("/admin/panels/order", { method: "PUT", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["panels"] }),
  });
  const move = (index: number, by: -1 | 1) => {
    const ids = panels.map((p) => p.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    order.mutate(ids);
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.panels.title} lead={t.cms.panels.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.panels.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {panels.map((p, i) => (
          <li key={p.id} className="flex gap-3 rounded-2xl border border-ink/10 bg-white/70 p-3">
            <FocusPreview image={p.image} focus={p.focus} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-serif text-xl">{lang === "cs" ? p.nameCs : p.nameEn}</p>
              <p className="text-xs text-ink-soft line-clamp-2">{lang === "cs" ? p.lineCs : p.lineEn}</p>
              <p className="text-xs text-ink-soft truncate">{(lang === "cs" ? p.tagsCs : p.tagsEn).join(" · ")}</p>
              <p className="text-xs text-ink-soft">
                {t.cms.panels.booking}: {p.bookingCategory ? t.cms.cats[p.bookingCategory] : t.cms.panels.bookingNone}
              </p>
              <Badge tone={p.isPublished ? "green" : "muted"}>{p.isPublished ? t.cms.published : t.cms.hidden}</Badge>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" aria-label={t.cms.moveUp} disabled={i === 0 || order.isPending} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" aria-label={t.cms.moveDown} disabled={i === panels.length - 1 || order.isPending} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <Button variant="secondary" onClick={() => setEditing(p)}>
                  {t.cms.edit}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editing && <PanelDialog panel={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
