"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { slugify, type MediaRef, type ReelAdmin } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import MediaPicker, { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { EmptyList, HiddenBadge, ListHint, OrderControls, useDragOrder, useOrder } from "@/admin/collection";
import type { BranchOption } from "@/admin/types";
import { Alert, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

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
  const [editing, setEditing] = useState<ReelAdmin | "new" | null>(null);
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: reels = [], error } = useQuery({ queryKey: ["reels"], queryFn: () => api<ReelAdmin[]>("/admin/reels"), enabled: canEdit });
  const { data: branches = [] } = useQuery({
    queryKey: ["branch-options"],
    queryFn: () => api<BranchOption[]>("/admin/branches/options"),
    enabled: canEdit,
  });
  const order = useOrder<ReelAdmin>("reels", "/admin/reels");
  const drag = useDragOrder((id, target) => order.moveTo(reels, id, target));
  const branchName = (id: number | null) => {
    const b = branches.find((x) => x.id === id);
    return b ? b.mall : t.cms.reels.defaultBranch;
  };

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.reels.title} lead={t.cms.reels.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.cms.reels.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <ListHint saving={order.saving} />
      {/* Phone-shaped cards, the way the reels look on the site */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4">
        {reels.map((r, i) => (
          <li
            key={r.id}
            {...drag.itemProps(r.id)}
            className={`group flex flex-col rounded-2xl border border-ink/10 bg-white/70 p-2 transition-[opacity,transform,box-shadow] hover:shadow-[0_12px_30px_-18px_rgba(17,38,26,0.5)] ${drag.state(r.id)}`}
          >
            <button
              type="button"
              onClick={() => setEditing(r)}
              aria-label={`${t.cms.edit}: ${lang === "cs" ? r.tagCs : r.tagEn}`}
              className="relative block cursor-pointer overflow-hidden rounded-[1.1rem] bg-forest"
            >
              <MediaThumb
                media={r.poster ?? r.video}
                className={`w-full aspect-[9/16] transition-transform duration-500 group-hover:scale-[1.04] ${r.isPublished ? "" : "grayscale opacity-60"}`}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
              <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-paper backdrop-blur">
                {lang === "cs" ? r.tagCs : r.tagEn}
              </span>
              {!r.isPublished && <HiddenBadge className="absolute left-2 top-9" />}
              <span className="absolute inset-x-2.5 bottom-2.5 text-left font-serif italic text-[15px] leading-snug text-paper line-clamp-3">
                {lang === "cs" ? r.captionCs : r.captionEn}
              </span>
            </button>
            <p className="mt-2.5 flex items-center gap-1.5 px-1 text-xs text-ink-soft">
              <svg aria-hidden viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14Z" />
                <circle cx="8" cy="6.5" r="1.6" />
              </svg>
              <span className="truncate">{branchName(r.branchId)}</span>
            </p>
            <OrderControls
              className="mx-1 mb-1 mt-2 self-start"
              index={i}
              first={i === 0}
              last={i === reels.length - 1}
              disabled={order.saving}
              onUp={() => order.moveTo(reels, r.id, reels[i - 1].id)}
              onDown={() => order.moveTo(reels, r.id, reels[i + 1].id)}
            />
          </li>
        ))}
      </ul>
      {!reels.length && !error && <EmptyList text={t.cms.empty} />}
      {editing && <ReelDialog reel={editing} branches={branches} onClose={() => setEditing(null)} />}
    </div>
  );
}
