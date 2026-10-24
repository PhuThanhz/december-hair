"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api, uploadMedia } from "./api";
import type { MediaItem, MediaKind, MediaRef } from "./cms";
import { useAdminT } from "./Providers";
import { Alert, Button, Dialog, Input } from "./ui";

const ACCEPT: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm",
};

/** A small preview of a library file */
export function MediaThumb({ media, className = "h-20 w-20" }: { media: MediaRef; className?: string }) {
  return media.kind === "image" ? (
    // eslint-disable-next-line @next/next/no-img-element -- library thumbnails are already small WebP files
    <img src={media.thumb} alt={media.altCs} className={`${className} rounded-xl object-cover bg-bone`} />
  ) : (
    // #t=0.5: show a frame from half a second in (many clips open on black)
    <video src={`${media.url}#t=0.5`} muted preload="metadata" className={`${className} rounded-xl object-cover bg-forest`} />
  );
}

function Library({ kind, onPick, onClose }: { kind: MediaKind; onPick: (m: MediaRef) => void; onClose: () => void }) {
  const { t } = useAdminT();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const { data: items = [] } = useQuery({
    queryKey: ["media", kind, q],
    queryFn: () => api<MediaItem[]>(`/admin/media?kind=${kind}&limit=200${q ? `&q=${encodeURIComponent(q)}` : ""}`),
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const added = await uploadMedia<MediaItem>(file);
      qc.invalidateQueries({ queryKey: ["media"] });
      onPick(added);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t.somethingWrong);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open title={t.cms.media.pick} onClose={onClose} closeLabel={t.close}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder={t.cms.media.search} value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 min-w-[10rem]" />
          <Button type="button" variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? t.cms.uploading : t.cms.upload}
          </Button>
          <input ref={input} type="file" hidden accept={ACCEPT[kind]} onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        <p className="text-xs text-ink-soft">{t.cms.media.drop}</p>
        {error && <Alert>{error}</Alert>}
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[50svh] overflow-y-auto">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onPick(m)} className="block w-full cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-moss" title={m.altCs || undefined}>
                <MediaThumb media={m} className="aspect-square w-full" />
              </button>
            </li>
          ))}
        </ul>
        {!items.length && <p className="text-sm text-ink-soft">{t.cms.empty}</p>}
      </div>
    </Dialog>
  );
}

/** Pick one file from the media library (or upload one there) for a field */
export default function MediaPicker({
  label,
  help,
  kind,
  value,
  onChange,
  allowNone = false,
}: {
  label: string;
  help?: string;
  kind: MediaKind;
  value: MediaRef | null;
  onChange: (m: MediaRef | null) => void;
  allowNone?: boolean;
}) {
  const { t } = useAdminT();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        {value ? <MediaThumb media={value} /> : <div className="h-20 w-20 rounded-xl border border-dashed border-ink/20" />}
        <div className="flex flex-col items-start gap-1">
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            {value ? t.cms.change : t.cms.choose}
          </Button>
          {value && allowNone && (
            <Button type="button" variant="ghost" onClick={() => onChange(null)}>
              {t.cms.remove}
            </Button>
          )}
        </div>
      </div>
      {help && <p className="text-xs text-ink-soft">{help}</p>}
      {open && (
        <Library
          kind={kind}
          onClose={() => setOpen(false)}
          onPick={(m) => {
            onChange(m);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
