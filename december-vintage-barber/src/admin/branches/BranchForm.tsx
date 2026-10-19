"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api";
import { slugify, type BranchAdmin, type MediaRef } from "../cms";
import { fmt } from "../i18n";
import MediaPicker from "../MediaPicker";
import { useAdminT } from "../Providers";
import { Alert, Button, Card, Checkbox, Field, Input } from "../ui";
import { fullWeek, SpecialDaysEditor, WeeklyHoursEditor } from "./HoursEditor";
import MapPreview from "./MapPreview";

export type BranchDraft = Omit<BranchAdmin, "id" | "sortOrder" | "image"> & { image: MediaRef | null };

export const NEW_BRANCH: BranchDraft = {
  slug: "",
  isPublished: false,
  cityCs: "",
  cityEn: "",
  mall: "",
  shortName: "",
  bookAtCs: "",
  bookAtEn: "",
  street: "",
  postalCode: "",
  locality: "",
  phone: "",
  email: null,
  // Prague, until the pin is dragged to the salon
  lat: 50.0755,
  lng: 14.4378,
  mapBearing: -12,
  mapZoom: 16.2,
  mapPitch: 58,
  googleMapsUrl: "",
  image: null,
  hours: fullWeek([]),
  specialDays: [],
};

export default function BranchForm({ id, initial, isEditor }: { id: number | null; initial: BranchDraft; isEditor: boolean }) {
  const { t } = useAdminT();
  const router = useRouter();
  const qc = useQueryClient();
  const [d, setD] = useState<BranchDraft>({ ...initial, hours: fullWeek(initial.hours) });
  const set = (patch: Partial<BranchDraft>) => setD((prev) => ({ ...prev, ...patch }));
  const b = t.cms.branches;

  const save = useMutation({
    mutationFn: () => {
      const { image, slug, isPublished, ...rest } = d;
      const body = { ...rest, email: d.email || null, imageId: image?.id ?? null };
      if (id === null) return api<BranchAdmin>("/admin/branches", { method: "POST", body: { ...body, slug: slug || slugify(d.mall || d.cityCs) } });
      return api<BranchAdmin>(`/admin/branches/${id}`, { method: "PATCH", body: isEditor ? { ...body, slug, isPublished } : body });
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      qc.invalidateQueries({ queryKey: ["branch-options"] });
      if (id === null) router.replace(`/admin/branches/${saved.id}`);
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/admin/branches/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      router.replace("/admin/branches");
    },
  });
  const error = save.error ?? remove.error;

  const text = (label: string, key: keyof BranchDraft, opts: { help?: string; required?: boolean; type?: string } = {}) => (
    <Field label={label} help={opts.help}>
      {(fid) => (
        <Input id={fid} type={opts.type} required={opts.required} value={String(d[key] ?? "")} onChange={(e) => set({ [key]: e.target.value } as Partial<BranchDraft>)} />
      )}
    </Field>
  );
  const num = (label: string, key: "lat" | "lng" | "mapBearing" | "mapZoom" | "mapPitch", step: string) => (
    <Field label={label}>
      {(fid) => <Input id={fid} type="number" step={step} required value={d[key]} onChange={(e) => set({ [key]: Number(e.target.value) })} />}
    </Field>
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      {id !== null && !d.isPublished && <Alert>{b.notPublished}</Alert>}

      <Card>
        <h2 className="font-serif text-xl mb-5">{b.details}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text(`${b.city} · ${t.cms.cs}`, "cityCs", { required: true })}
          {text(`${b.city} · ${t.cms.en}`, "cityEn", { required: true })}
          {text(b.mall, "mall", { required: true })}
          {text(b.shortName, "shortName", { help: b.shortHelp })}
          {text(`${b.bookAt} · ${t.cms.cs}`, "bookAtCs", { help: b.bookAtHelp })}
          {text(`${b.bookAt} · ${t.cms.en}`, "bookAtEn")}
          {text(b.street, "street", { required: true })}
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            {text(b.postal, "postalCode")}
            {text(b.locality, "locality", { required: true })}
          </div>
          {text(b.phone, "phone", { required: true, type: "tel" })}
          {text(b.email, "email", { help: b.emailHelp, type: "email" })}
          {text(b.googleMaps, "googleMapsUrl", { type: "url" })}
          {isEditor && id === null && text(t.cms.slug, "slug", { help: t.cms.slugHelp })}
        </div>
        <div className="mt-5">
          <MediaPicker label={b.photo} kind="image" value={d.image} allowNone onChange={(m) => set({ image: m })} />
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl mb-5">{b.location}</h2>
        <MapPreview
          lat={d.lat}
          lng={d.lng}
          camera={{ bearing: d.mapBearing, zoom: d.mapZoom, pitch: d.mapPitch }}
          onMove={(p) => set(p)}
          onCamera={(c) => set({ mapBearing: c.bearing, mapZoom: c.zoom, mapPitch: c.pitch })}
        />
        <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-5">
          {num(b.lat, "lat", "0.000001")}
          {num(b.lng, "lng", "0.000001")}
          {num(b.bearing, "mapBearing", "0.1")}
          {num(b.zoom, "mapZoom", "0.1")}
          {num(b.pitch, "mapPitch", "0.1")}
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-xl mb-4">{b.hours}</h2>
        <WeeklyHoursEditor value={d.hours} onChange={(hours) => set({ hours })} />
        <h3 className="font-serif text-lg mt-8 mb-1">{b.special}</h3>
        <p className="text-xs text-ink-soft mb-3">{b.specialHelp}</p>
        <SpecialDaysEditor value={d.specialDays} onChange={(specialDays) => set({ specialDays })} />
      </Card>

      {isEditor && id !== null && <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />}
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {save.isSuccess && !save.isPending && <Alert tone="success">{t.cms.savedSite}</Alert>}

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-2 border-t border-ink/10 bg-paper/95 px-1 py-4 backdrop-blur">
        {isEditor && id !== null ? (
          <Button
            type="button"
            variant="ghost"
            disabled={remove.isPending}
            onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: d.mall })) && remove.mutate()}
          >
            {t.cms.delete}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? t.saving : id === null ? t.cms.create : t.save}
        </Button>
      </div>
    </form>
  );
}
