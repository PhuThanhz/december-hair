"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Me, UiLang } from "@/admin/types";
import { Alert, Button, Card, Field, Input, PageHeader, Select } from "@/admin/ui";

function ProfileForm({ me }: { me: Me }) {
  const { t, setLang } = useAdminT();
  const qc = useQueryClient();
  const [name, setName] = useState(me.name);
  const profile = useMutation({
    mutationFn: () => api<Me>("/auth/me", { method: "PATCH", body: { name } }),
    onSuccess: (updated) => qc.setQueryData(["me"], updated),
  });

  return (
    <Card>
      <h2 className="font-serif text-xl mb-5">{t.account.profile}</h2>
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
        <Button type="submit" disabled={profile.isPending || name === me.name}>
          {profile.isPending ? t.saving : t.save}
        </Button>
      </form>
    </Card>
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
    <div className="space-y-8 max-w-2xl">
      <PageHeader title={t.account.title} />

      <ProfileForm key={me.id} me={me} />

      <Card>
        <h2 className="font-serif text-xl mb-5">{t.account.password}</h2>
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
          <Button type="submit" disabled={password.isPending}>
            {password.isPending ? t.saving : t.save}
          </Button>
        </form>
      </Card>
    </div>
  );
}
