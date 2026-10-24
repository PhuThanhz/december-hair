"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { MediaRef, Slot } from "@/admin/cms";
import MediaPicker from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Button, Card, PageHeader } from "@/admin/ui";

/** A tiny sketch of the home page with this slot lit up, so editors know which video is which */
function PageMap({ slotKey }: { slotKey: string }) {
  const lit = "bg-moss";
  const dim = "bg-ink/10";
  const hero = slotKey.startsWith("hero_");
  const panel = { hero_panel_1: 0, hero_panel_2: 1, hero_panel_3: 2 }[slotKey];
  const tile = { about_cut: 0, about_colour: 1, about_care: 2 }[slotKey];
  return (
    <div aria-hidden className="w-20 shrink-0 rounded-lg border border-ink/10 bg-white p-1.5">
      <div className="mb-1 h-1 w-6 rounded-full bg-ink/15" />
      {hero ? (
        <div className="relative grid h-11 grid-cols-3 gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`rounded-[3px] ${panel === i ? lit : dim}`} />
          ))}
          {slotKey === "hero_reflection" && <span className={`absolute inset-x-1 top-1/2 h-2.5 -translate-y-1/2 rounded-[2px] ${lit}`} />}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-ink/15" />
          <div className="grid h-7 grid-cols-3 gap-0.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`rounded-[3px] ${tile === i ? lit : dim}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** One place on the page: its video and poster, saved on their own */
function SlotCard({ slot }: { slot: Slot }) {
  const { t, lang } = useAdminT();
  const qc = useQueryClient();
  const [video, setVideo] = useState<MediaRef | null>(slot.media);
  const [poster, setPoster] = useState<MediaRef | null>(slot.poster);
  const dirty = video?.id !== slot.media?.id || poster?.id !== slot.poster?.id;

  const save = useMutation({
    mutationFn: () => api<Slot[]>(`/admin/site-media/${slot.key}`, { method: "PUT", body: { mediaId: video?.id, posterId: poster?.id ?? null } }),
    onSuccess: (slots) => qc.setQueryData(["site-media"], slots),
  });
  const alt = video ? (lang === "cs" ? video.altCs : video.altEn) : "";

  return (
    <Card className={`space-y-5 transition-shadow ${dirty ? "ring-2 ring-amber-400/60" : ""}`}>
      <div className="flex items-start gap-4">
        <PageMap slotKey={slot.key} />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl leading-tight">{t.cms.slots.keys[slot.key] ?? slot.key}</h3>
          <p className="mt-1 text-xs text-ink-soft">{t.cms.slots.where}</p>
        </div>
        {dirty && (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {t.cms.slots.unsaved}
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MediaPicker label={t.cms.video} kind="video" value={video} onChange={setVideo} />
        <MediaPicker label={t.cms.poster} help={t.cms.posterHelp} kind="image" value={poster} allowNone onChange={setPoster} />
      </div>
      {slot.key.startsWith("hero_panel") && (
        <p className="text-xs text-ink-soft">
          {t.cms.media.alt}: <span className="text-ink">{alt || "—"}</span> · {t.cms.slots.altHelp}
        </p>
      )}
      {save.isError && <Alert>{save.error instanceof ApiError ? save.error.message : t.somethingWrong}</Alert>}
      {save.isSuccess && !dirty && <Alert tone="success">{t.cms.savedSite}</Alert>}
      {dirty && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setVideo(slot.media);
              setPoster(slot.poster);
            }}
            disabled={save.isPending}
          >
            {t.cancel}
          </Button>
          <Button onClick={() => save.mutate()} disabled={!video || save.isPending}>
            {save.isPending ? t.saving : t.save}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function SiteMediaPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: slots = [], error } = useQuery({
    queryKey: ["site-media"],
    queryFn: () => api<Slot[]>("/admin/site-media"),
    enabled: canEdit,
  });

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;
  const groups = (["hero", "about"] as const)
    .map((g) => ({ g, items: slots.filter((s) => s.key.startsWith(`${g}_`)) }))
    .concat([{ g: "other" as never, items: slots.filter((s) => !/^(hero|about)_/.test(s.key)) }])
    .filter((x) => x.items.length);
  return (
    <div className="space-y-8">
      <PageHeader title={t.cms.slots.title} lead={t.cms.slots.lead} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {groups.map(({ g, items }) => (
        <section key={g} className="space-y-4">
          {t.cms.slots.groups[g] && <h2 className="label text-ink-soft">{t.cms.slots.groups[g]}</h2>}
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((s) => (
              <SlotCard key={s.key} slot={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
