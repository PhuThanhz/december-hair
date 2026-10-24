"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, uploadMedia } from "@/admin/api";
import type { MediaItem, MediaKind, MediaUsage } from "@/admin/cms";
import { fmt } from "@/admin/i18n";
import { MediaThumb } from "@/admin/MediaPicker";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Button, Dialog, Field, Input, PageHeader } from "@/admin/ui";
import { EmptyList, FilterBar } from "@/admin/collection";

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
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [dragging, setDragging] = useState(false);
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
  const m = t.cms.ui.media;

  return (
    <div
      className="relative space-y-6"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragging(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      <PageHeader
        title={t.cms.media.title}
        lead={t.cms.media.lead}
        actions={
          <Button onClick={() => input.current?.click()} disabled={uploading > 0}>
            {uploading ? `${t.cms.uploading} (${uploading})` : `+ ${t.cms.upload}`}
          </Button>
        }
      />
      <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => onFiles(e.target.files)} />

      {/* Drop zone: drag files from the computer anywhere on the page, or click */}
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading > 0}
        className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-5 text-left transition-colors ${
          dragging ? "border-moss bg-celadon/60" : "border-ink/15 bg-white/50 hover:border-moss/60 hover:bg-white/80"
        }`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-paper">
          {uploading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
          ) : (
            <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M10 13V3.5M6 7.5l4-4 4 4M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{uploading ? `${t.cms.uploading} (${uploading})` : m.dropHere}</span>
          <span className="block text-xs text-ink-soft">
            {m.orClick} · {t.cms.media.drop}
          </span>
        </span>
      </button>
      {uploadError && <Alert>{uploadError}</Alert>}
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      <FilterBar<MediaKind>
        value={kind || "all"}
        onChange={(k) => setKind(k === "all" ? "" : k)}
        options={[
          { key: "all", label: t.cms.media.all },
          { key: "image", label: t.cms.media.images },
          { key: "video", label: t.cms.media.videos },
        ]}
        search={q}
        onSearch={setQ}
      />

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => setOpen(it)}
              className="group block w-full cursor-pointer rounded-2xl border border-ink/10 bg-white/70 p-2 text-left transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(17,38,26,0.5)]"
            >
              <span className="relative block overflow-hidden rounded-xl">
                <MediaThumb media={it} className="aspect-square w-full transition-transform duration-500 group-hover:scale-[1.04]" />
                {it.kind === "video" && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper backdrop-blur">
                    <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                      <path d="M3 2v8l7-4z" />
                    </svg>
                    {m.video}
                  </span>
                )}
                {!it.used && (
                  <span className="absolute right-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-medium text-ink-soft">{t.cms.media.unused}</span>
                )}
              </span>
              <span className="mt-2 flex items-center justify-between gap-2 px-1 pb-0.5">
                {it.altCs ? (
                  <span className="truncate text-xs">{lang === "cs" ? it.altCs : it.altEn || it.altCs}</span>
                ) : (
                  <span className="truncate text-xs italic text-amber-700">{m.noAlt}</span>
                )}
                {it.used > 0 && <span className="shrink-0 text-[11px] tabular-nums text-ink-soft">{fmt(t.cms.media.used, { n: String(it.used) })}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!items.length && !error && <EmptyList text={q ? t.cms.list.noMatch : t.cms.empty} />}
      {open && <MediaDialog key={open.id} item={open} canDelete={canDelete} onClose={() => setOpen(null)} />}
    </div>
  );
}
