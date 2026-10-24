"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Me, UiLang } from "@/admin/types";
import { Alert, Button, Field, Input, PageHeader, Select } from "@/admin/ui";
import { initials, Section } from "@/admin/form-kit";

function ProfileForm({ me }: { me: Me }) {
  const { t, setLang } = useAdminT();
  const qc = useQueryClient();
  const [name, setName] = useState(me.name);
  const profile = useMutation({
    mutationFn: () => api<Me>("/auth/me", { method: "PATCH", body: { name } }),
    onSuccess: (updated) => qc.setQueryData(["me"], updated),
  });

  return (
    <Section title={t.account.profile} help={t.cms.ui.sections.profile}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          profile.mutate();
        }}
      >
        <Field label={t.account.email}>{(id) => <Input id={id} value={me.email} disabled />}</Field>
        <Field label={t.account.name}>{(id) => <Input id={id} required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label={t.account.language}>
          {(id) => (
            <Select id={id} value={me.uiLang} onChange={(e) => setLang(e.target.value as UiLang)}>
              {(["cs", "en"] as UiLang[]).map((l) => (
                <option key={l} value={l}>
                  {t.langs[l]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {profile.isError && <Alert>{profile.error instanceof ApiError ? profile.error.message : t.somethingWrong}</Alert>}
        {profile.isSuccess && <Alert tone="success">{t.saved}</Alert>}
        <div className="flex justify-end border-t border-ink/10 pt-4">
          <Button type="submit" disabled={profile.isPending || name === me.name}>
            {profile.isPending ? t.saving : t.save}
          </Button>
        </div>
      </form>
    </Section>
  );
}

export default function AccountPage() {
  const { t } = useAdminT();
  const { data: me } = useMe();

  const [pw, setPw] = useState({ current: "", next: "", repeat: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const password = useMutation({
    mutationFn: () => api("/auth/change-password", { method: "POST", body: { currentPassword: pw.current, newPassword: pw.next } }),
    onSuccess: () => setPw({ current: "", next: "", repeat: "" }),
    onError: (e) => setPwError(e instanceof ApiError ? e.message : t.somethingWrong),
  });

  if (!me) return null;

  return (
    <div>
      <PageHeader title={t.account.title} />

      {/* Who is signed in */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-forest p-5 text-paper sm:p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper font-serif text-xl text-forest">{initials(me.name)}</span>
        <span className="min-w-0">
          <span className="block truncate font-serif text-2xl leading-tight">{me.name}</span>
          <span className="block truncate text-sm text-paper/70">
            {me.email} · {t.roles[me.role]}
          </span>
        </span>
      </div>

      <ProfileForm key={me.id} me={me} />

      <Section title={t.account.password} help={t.cms.ui.sections.password}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setPwError(null);
            if (pw.next !== pw.repeat) return setPwError(t.account.mismatch);
            password.mutate();
          }}
        >
          <Field label={t.account.current}>
            {(id) => <Input id={id} type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />}
          </Field>
          <Field label={t.account.next} help={t.users.passwordHelp}>
            {(id) => <Input id={id} type="password" autoComplete="new-password" required minLength={10} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}
          </Field>
          <Field label={t.account.repeat}>
            {(id) => <Input id={id} type="password" autoComplete="new-password" required value={pw.repeat} onChange={(e) => setPw({ ...pw, repeat: e.target.value })} />}
          </Field>
          {pwError && <Alert>{pwError}</Alert>}
          {password.isSuccess && <Alert tone="success">{t.account.changed}</Alert>}
          <div className="flex justify-end border-t border-ink/10 pt-4">
            <Button type="submit" disabled={password.isPending}>
              {password.isPending ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
