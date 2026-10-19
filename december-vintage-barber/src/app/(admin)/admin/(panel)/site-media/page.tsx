"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { MediaRef, Slot } from "@/admin/cms";
import MediaPicker from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Button, Card, PageHeader } from "@/admin/ui";

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
    <Card className="space-y-4">
      <h2 className="font-serif text-xl">{t.cms.slots.keys[slot.key] ?? slot.key}</h2>
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
      <Button onClick={() => save.mutate()} disabled={!video || !dirty || save.isPending}>
        {save.isPending ? t.saving : t.save}
      </Button>
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
  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.slots.title} lead={t.cms.slots.lead} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      <div className="grid gap-4 xl:grid-cols-2">
        {slots.map((s) => (
          <SlotCard key={s.key} slot={s} />
        ))}
      </div>
    </div>
  );
}
