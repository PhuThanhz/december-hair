"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { slugify, type MediaRef, type ReelAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import MediaPicker, { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import type { BranchOption } from "@/admin/types";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = {
  slug: string;
  video: MediaRef | null;
  poster: MediaRef | null;
  tagCs: string;
  tagEn: string;
  captionCs: string;
  captionEn: string;
  branchId: number | null;
  isPublished: boolean;
};

const BLANK: Draft = {
  slug: "",
  video: null,
  poster: null,
  tagCs: "",
  tagEn: "",
  captionCs: "",
  captionEn: "",
  branchId: null,
  isPublished: true,
};

function ReelDialog({ reel, branches, onClose }: { reel: ReelAdmin | "new"; branches: BranchOption[]; onClose: () => void }) {
  const { t, lang } = useAdminT();
  const qc = useQueryClient();
  const isNew = reel === "new";
  const [d, setD] = useState<Draft>(isNew ? BLANK : { ...reel });
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const done = () => {
    qc.invalidateQueries({ queryKey: ["reels"] });
    onClose();
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        videoId: d.video?.id,
        posterId: d.poster?.id,
        tagCs: d.tagCs,
        tagEn: d.tagEn,
        captionCs: d.captionCs,
        captionEn: d.captionEn,
        branchId: d.branchId,
        isPublished: d.isPublished,
      };
      return isNew
        ? api("/admin/reels", { method: "POST", body: { ...body, slug: d.slug || slugify(d.tagCs || d.captionCs) } })
        : api(`/admin/reels/${reel.id}`, { method: "PATCH", body });
    },
    onSuccess: done,
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/reels/${(reel as ReelAdmin).id}`, { method: "DELETE" }),
    onSuccess: done,
  });
  const error = save.error ?? remove.error;
  const pair = (label: string, cs: keyof Draft, en: keyof Draft) =>
    (["cs", "en"] as const).map((l) => (
      <Field key={l} label={`${label} · ${t.cms[l]}`}>
        {(id) => (
          <Input
            id={id}
            value={String(d[l === "cs" ? cs : en] ?? "")}
            onChange={(e) => set({ [l === "cs" ? cs : en]: e.target.value } as Partial<Draft>)}
          />
        )}
      </Field>
    ));

  return (
    <Dialog open title={isNew ? t.cms.reels.add : t.cms.edit} onClose={onClose} closeLabel={t.close}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaPicker label={t.cms.video} kind="video" value={d.video} onChange={(m) => set({ video: m })} />
          <MediaPicker label={t.cms.poster} help={t.cms.posterHelp} kind="image" value={d.poster} onChange={(m) => set({ poster: m })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {pair(t.cms.reels.tag, "tagCs", "tagEn")}
          {pair(t.cms.reels.caption, "captionCs", "captionEn")}
        </div>
        <Field label={t.cms.reels.branch}>
          {(id) => (
            <Select id={id} value={d.branchId ?? ""} onChange={(e) => set({ branchId: Number(e.target.value) || null })}>
              <option value="">{t.cms.reels.defaultBranch}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {lang === "cs" ? b.cityCs : b.cityEn} — {b.mall}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
        {isNew && (
          <Field label={t.cms.slug} help={t.cms.slugHelp}>
            {(id) => <Input id={id} placeholder={slugify(d.tagCs || d.captionCs)} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} />}
          </Field>
        )}
        {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!isNew ? (
            <Button
              type="button"
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: reel.tagCs || reel.slug })) && remove.mutate()}
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
            <Button type="submit" disabled={save.isPending || !d.video || !d.poster}>
              {save.isPending ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default function ReelsPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ReelAdmin | "new" | null>(null);
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: reels = [], error } = useQuery({ queryKey: ["reels"], queryFn: () => api<ReelAdmin[]>("/admin/reels"), enabled: canEdit });
  const { data: branches = [] } = useQuery({
    queryKey: ["branch-options"],
    queryFn: () => api<BranchOption[]>("/admin/branches/options"),
    enabled: canEdit,
  });
  const branchName = (id: number | null) => {
    const b = branches.find((x) => x.id === id);
    return b ? b.mall : t.cms.reels.defaultBranch;
  };

  const order = useMutation({
    mutationFn: (ids: number[]) => api("/admin/reels/order", { method: "PUT", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["reels"] }),
  });
  const move = (index: number, by: -1 | 1) => {
    const ids = reels.map((r) => r.id);
    const to = index + by;
    if (to < 0 || to >= ids.length) return;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    order.mutate(ids);
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.reels.title} lead={t.cms.reels.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.reels.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {reels.map((r, i) => (
          <li key={r.id} className="flex gap-3 rounded-2xl border border-ink/10 bg-white/70 p-3">
            <MediaThumb media={r.poster ?? r.video} className="h-28 w-[4.5rem] shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium truncate">{lang === "cs" ? r.tagCs : r.tagEn}</p>
              <p className="text-xs text-ink-soft line-clamp-2">{lang === "cs" ? r.captionCs : r.captionEn}</p>
              <p className="text-xs text-ink-soft truncate">{branchName(r.branchId)}</p>
              <Badge tone={r.isPublished ? "green" : "muted"}>{r.isPublished ? t.cms.published : t.cms.hidden}</Badge>
              <div className="flex gap-1 pt-1">
                <Button variant="ghost" aria-label={t.cms.moveUp} disabled={i === 0 || order.isPending} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" aria-label={t.cms.moveDown} disabled={i === reels.length - 1 || order.isPending} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <Button variant="secondary" onClick={() => setEditing(r)}>
                  {t.cms.edit}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editing && <ReelDialog reel={editing} branches={branches} onClose={() => setEditing(null)} />}
    </div>
  );
}
