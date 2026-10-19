"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, uploadMedia } from "@/admin/api";
import type { MediaItem, MediaKind, MediaUsage } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Badge, Button, Dialog, Field, Input, PageHeader } from "@/admin/ui";

const size = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} kB`);

/** One file: preview, description, where it is used, and removal once nothing uses it */
function MediaDialog({ item, canDelete, onClose }: { item: MediaItem; canDelete: boolean; onClose: () => void }) {
  const { t } = useAdminT();
  const qc = useQueryClient();
  const [alt, setAlt] = useState({ altCs: item.altCs, altEn: item.altEn });
  const { data: usage = [] } = useQuery({ queryKey: ["media-usage", item.id], queryFn: () => api<MediaUsage[]>(`/admin/media/${item.id}/usage`) });

  const save = useMutation({
    mutationFn: () => api<MediaItem>(`/admin/media/${item.id}`, { method: "PATCH", body: alt }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/media/${item.id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media"] });
      onClose();
    },
  });
  const error = save.error ?? remove.error;

  return (
    <Dialog open title={t.cms.media.title} onClose={onClose} closeLabel={t.close}>
      <div className="space-y-5">
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- the library's own pre-sized file
          <img src={item.url} alt={item.altCs} className="max-h-72 w-full rounded-2xl object-contain bg-bone" />
        ) : (
          <video src={item.url} controls muted className="max-h-72 w-full rounded-2xl bg-forest" />
        )}
        <p className="text-xs text-ink-soft">
          {item.width && item.height ? `${item.width} × ${item.height} · ` : ""}
          {t.cms.media.size}: {size(item.sizeBytes)} · {item.mime}
        </p>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {(["cs", "en"] as const).map((l) => (
            <Field key={l} label={`${t.cms.media.alt} · ${t.cms[l]}`} help={l === "cs" ? t.cms.media.altHelp : undefined}>
              {(id) => (
                <Input
                  id={id}
                  lang={l}
                  value={l === "cs" ? alt.altCs : alt.altEn}
                  onChange={(e) => setAlt(l === "cs" ? { ...alt, altCs: e.target.value } : { ...alt, altEn: e.target.value })}
                />
              )}
            </Field>
          ))}
          {save.isSuccess && <Alert tone="success">{t.saved}</Alert>}
          <Button type="submit" variant="secondary" disabled={save.isPending}>
            {save.isPending ? t.saving : t.save}
          </Button>
        </form>

        <div>
          <p className="text-sm font-medium">{t.cms.media.usage}</p>
          {usage.length ? (
            <ul className="mt-1 space-y-0.5 text-sm text-ink-soft">
              {usage.map((u, i) => (
                <li key={i}>
                  {u.label} <span className="text-xs">({u.entity} · {u.field})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-ink-soft">{t.cms.media.unused}</p>
          )}
        </div>

        {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
        {canDelete && (
          <div className="border-t border-ink/10 pt-4">
            {usage.length ? (
              <p className="text-xs text-ink-soft">{t.cms.media.blocked}</p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={remove.isPending}
                onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: item.altCs || item.url.split("/").slice(-2).join("/") })) && remove.mutate()}
              >
                {t.cms.delete}
              </Button>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default function MediaPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [kind, setKind] = useState<MediaKind | "">("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const { data: items = [], error } = useQuery({
    queryKey: ["media", kind || "all", q],
    queryFn: () => api<MediaItem[]>(`/admin/media?limit=200${kind ? `&kind=${kind}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`),
    enabled: !!me,
  });

  // Several files at once, one after another (each is checked and resized on the server)
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try {
        await uploadMedia(file);
      } catch (e) {
        setUploadError(`${file.name}: ${e instanceof ApiError ? e.message : t.somethingWrong}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    qc.invalidateQueries({ queryKey: ["media"] });
    if (input.current) input.current.value = "";
  };

  if (!me) return null;
  const canDelete = me.role === "admin" || me.role === "editor";
  const tabs: [MediaKind | "", string][] = [
    ["", t.cms.media.all],
    ["image", t.cms.media.images],
    ["video", t.cms.media.videos],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.cms.media.title}
        lead={t.cms.media.lead}
        actions={
          <Button onClick={() => input.current?.click()} disabled={uploading > 0}>
            {uploading ? t.cms.uploading : `+ ${t.cms.upload}`}
          </Button>
        }
      />
      <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => onFiles(e.target.files)} />
      <p className="text-xs text-ink-soft">{t.cms.media.drop}</p>
      {uploadError && <Alert>{uploadError}</Alert>}
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(([k, label]) => (
          <button
            key={k || "all"}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm ${kind === k ? "bg-forest text-paper" : "bg-bone text-ink-soft hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
        <Input type="search" placeholder={t.cms.media.search} aria-label={t.cms.media.search} value={q} onChange={(e) => setQ(e.target.value)} className="ml-auto max-w-xs" />
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => setOpen(m)} className="block w-full cursor-pointer text-left">
              <MediaThumb media={m} className="aspect-square w-full" />
              <span className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-ink-soft">{m.altCs || "—"}</span>
                <Badge tone={m.used ? "green" : "muted"}>{m.used ? fmt(t.cms.media.used, { n: String(m.used) }) : t.cms.media.unused}</Badge>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!items.length && !error && <p className="text-sm text-ink-soft">{t.cms.empty}</p>}
      {open && <MediaDialog key={open.id} item={open} canDelete={canDelete} onClose={() => setOpen(null)} />}
    </div>
  );
}
