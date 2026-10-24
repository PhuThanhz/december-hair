"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api";
import { slugify, type BranchAdmin, type MediaRef } from "../cms";
import { fmt } from "../i18n";
import MediaPicker from "../MediaPicker";
import { useAdminT } from "../Providers";
import { Alert, Button, Field, Input } from "../ui";
import { SaveBar, Section } from "../form-kit";
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
  // What is saved on the server, to tell whether there is anything to save
  const [base, setBase] = useState<BranchDraft>(d);
  const dirty = id === null || JSON.stringify(d) !== JSON.stringify(base);
  const set = (patch: Partial<BranchDraft>) => setD((prev) => ({ ...prev, ...patch }));
  const b = t.cms.branches;

  const save = useMutation({
    mutationFn: (draft: BranchDraft) => {
      const { image, slug, isPublished, ...rest } = draft;
      const body = { ...rest, email: draft.email || null, imageId: image?.id ?? null };
      if (id === null) return api<BranchAdmin>("/admin/branches", { method: "POST", body: { ...body, slug: slug || slugify(draft.mall || draft.cityCs) } });
      return api<BranchAdmin>(`/admin/branches/${id}`, { method: "PATCH", body: isEditor ? { ...body, slug, isPublished } : body });
    },
    onSuccess: (saved, draft) => {
      setBase(draft);
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
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(d);
      }}
    >
      {id !== null && !d.isPublished && <Alert>{b.notPublished}</Alert>}

      <Section title={t.cms.ui.sections.name} help={t.cms.ui.sections.nameHelp}>
        <div className="grid gap-4 sm:grid-cols-2">
          {text(`${b.city} · ${t.cms.cs}`, "cityCs", { required: true })}
          {text(`${b.city} · ${t.cms.en}`, "cityEn", { required: true })}
          {text(b.mall, "mall", { required: true })}
          {text(b.shortName, "shortName", { help: b.shortHelp })}
          {isEditor && id === null && text(t.cms.slug, "slug", { help: t.cms.slugHelp })}
        </div>
      </Section>

      <Section title={t.cms.ui.sections.booking} help={t.cms.ui.sections.bookingHelp}>
        <div className="grid gap-4 sm:grid-cols-2">
          {text(`${b.bookAt} · ${t.cms.cs}`, "bookAtCs", { help: b.bookAtHelp })}
          {text(`${b.bookAt} · ${t.cms.en}`, "bookAtEn")}
        </div>
      </Section>

      <Section title={t.cms.ui.sections.contact} help={t.cms.ui.sections.contactHelp}>
        {text(b.street, "street", { required: true })}
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
          {text(b.postal, "postalCode")}
          {text(b.locality, "locality", { required: true })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {text(b.phone, "phone", { required: true, type: "tel" })}
          {text(b.email, "email", { help: b.emailHelp, type: "email" })}
        </div>
        {text(b.googleMaps, "googleMapsUrl", { type: "url" })}
      </Section>

      <Section title={t.cms.ui.sections.photo} help={t.cms.ui.sections.photoHelp}>
        <MediaPicker label={b.photo} kind="image" value={d.image} allowNone onChange={(m) => set({ image: m })} />
      </Section>

      <Section title={b.location} help={t.cms.ui.sections.mapHelp}>
        <MapPreview
          lat={d.lat}
          lng={d.lng}
          camera={{ bearing: d.mapBearing, zoom: d.mapZoom, pitch: d.mapPitch }}
          onMove={(p) => set(p)}
          onCamera={(c) => set({ mapBearing: c.bearing, mapZoom: c.zoom, mapPitch: c.pitch })}
        />
        <details className="group rounded-xl border border-ink/10 bg-paper/60 px-4 py-3">
          <summary className="cursor-pointer text-sm text-ink-soft group-open:mb-3">
            {b.lat} · {b.lng} · {b.camera}
          </summary>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
            {num(b.lat, "lat", "0.000001")}
            {num(b.lng, "lng", "0.000001")}
            {num(b.bearing, "mapBearing", "0.1")}
            {num(b.zoom, "mapZoom", "0.1")}
            {num(b.pitch, "mapPitch", "0.1")}
          </div>
        </details>
      </Section>

      <Section title={b.hours} help={t.cms.ui.sections.hoursHelp}>
        <WeeklyHoursEditor value={d.hours} onChange={(hours) => set({ hours })} />
        <div className="border-t border-ink/10 pt-5">
          <h3 className="font-serif text-lg mb-1">{b.special}</h3>
          <p className="text-xs text-ink-soft mb-3">{b.specialHelp}</p>
          <SpecialDaysEditor value={d.specialDays} onChange={(specialDays) => set({ specialDays })} />
        </div>
      </Section>

      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      <SaveBar
        dirty={dirty}
        saving={save.isPending}
        saved={save.isSuccess}
        onDiscard={id === null ? undefined : () => setD(base)}
        submitLabel={id === null ? t.cms.create : undefined}
        left={
          <>
            {isEditor && id !== null && (
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-moss" checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
                {t.cms.publish}
              </label>
            )}
            {isEditor && id !== null && (
              <Button
                type="button"
                variant="ghost"
                className="text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={remove.isPending}
                onClick={() => window.confirm(fmt(t.cms.confirmDelete, { name: d.mall })) && remove.mutate()}
              >
                {t.cms.delete}
              </Button>
            )}
          </>
        }
      />
    </form>
  );
}
