"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { PageAdmin } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, Button, Card, Checkbox, Field, Input, PageHeader } from "@/admin/ui";

const area =
  "w-full min-h-[18rem] rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 font-mono text-[13px] leading-relaxed text-ink focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20 resize-y";

/** One static page in both languages; saved on its own */
function PageCard({ page }: { page: PageAdmin }) {
  const { t } = useAdminT();
  const qc = useQueryClient();
  const [d, setD] = useState<PageAdmin>(page);
  const set = (patch: Partial<PageAdmin>) => setD((prev) => ({ ...prev, ...patch }));
  const dirty = JSON.stringify(d) !== JSON.stringify(page);

  const save = useMutation({
    mutationFn: () =>
      api<PageAdmin>(`/admin/pages/${page.slug}`, {
        method: "PATCH",
        body: { titleCs: d.titleCs, titleEn: d.titleEn, bodyMdCs: d.bodyMdCs, bodyMdEn: d.bodyMdEn, isPublished: d.isPublished },
      }),
    onSuccess: (saved) => qc.setQueryData<PageAdmin[]>(["pages"], (all) => all?.map((p) => (p.slug === saved.slug ? saved : p))),
  });

  return (
    <Card className="space-y-5">
      <h2 className="font-serif text-2xl">{t.cms.pages.names[page.slug] ?? page.slug}</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {(["cs", "en"] as const).map((l) => (
          <div key={l} className="space-y-3">
            <Field label={`${t.cms.pages.titleField} · ${t.cms[l]}`}>
              {(id) => (
                <Input id={id} lang={l} required value={l === "cs" ? d.titleCs : d.titleEn} onChange={(e) => set(l === "cs" ? { titleCs: e.target.value } : { titleEn: e.target.value })} />
              )}
            </Field>
            <Field label={`${t.cms.pages.body} · ${t.cms[l]}`}>
              {(id) => (
                <textarea
                  id={id}
                  lang={l}
                  className={area}
                  value={l === "cs" ? d.bodyMdCs : d.bodyMdEn}
                  onChange={(e) => set(l === "cs" ? { bodyMdCs: e.target.value } : { bodyMdEn: e.target.value })}
                />
              )}
            </Field>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-soft">{t.cms.pages.bodyHelp}</p>
      <Checkbox label={t.cms.publish} checked={d.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
      {save.isError && <Alert>{save.error instanceof ApiError ? save.error.message : t.somethingWrong}</Alert>}
      {save.isSuccess && !dirty && <Alert tone="success">{t.saved}</Alert>}
      <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
        {save.isPending ? t.saving : t.save}
      </Button>
    </Card>
  );
}

export default function PagesPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin" || me?.role === "editor";
  const { data: pages = [], error } = useQuery({
    queryKey: ["pages"],
    queryFn: () => api<PageAdmin[]>("/admin/pages"),
    enabled: canEdit,
  });

  if (!me) return null;
  if (!canEdit) return <Alert>{t.notAllowed}</Alert>;
  return (
    <div className="space-y-6">
      <PageHeader title={t.cms.pages.title} lead={t.cms.pages.lead} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {pages.map((p) => (
        <PageCard key={p.slug} page={p} />
      ))}
    </div>
  );
}
