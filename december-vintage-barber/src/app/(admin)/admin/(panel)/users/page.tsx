"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { formatDate } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import { ROLES, type AdminUser, type BranchOption, type Role, type UiLang } from "@/admin/types";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";

type Draft = {
  email: string;
  name: string;
  role: Role;
  uiLang: UiLang;
  isActive: boolean;
  branchIds: number[];
  password: string;
};

const EMPTY: Draft = { email: "", name: "", role: "editor", uiLang: "cs", isActive: true, branchIds: [], password: "" };

function UserDialog({ user, onClose }: { user: AdminUser | "new"; onClose: () => void }) {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const isNew = user === "new";
  const [d, setD] = useState<Draft>(
    isNew
      ? EMPTY
      : {
          email: user.email,
          name: user.name,
          role: user.role,
          uiLang: user.uiLang,
          isActive: user.isActive,
          branchIds: user.branches.map((b) => b.id),
          password: "",
        }
  );
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const { data: branches = [] } = useQuery({
    queryKey: ["branch-options"],
    queryFn: () => api<BranchOption[]>("/admin/branches/options"),
  });
  const self = !isNew && user.id === me?.id;

  const save = useMutation({
    mutationFn: () => {
      const branchIds = d.role === "branch_manager" ? d.branchIds : [];
      if (isNew) return api<AdminUser>("/admin/users", { method: "POST", body: { ...d, branchIds } });
      return api<AdminUser>(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: {
          name: d.name,
          role: d.role,
          uiLang: d.uiLang,
          isActive: d.isActive,
          branchIds,
          ...(d.password ? { password: d.password } : {}),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      if (self) qc.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
  });

  return (
    <Dialog open title={isNew ? t.users.add : t.users.edit} onClose={onClose} closeLabel={t.close}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label={t.users.email}>
          {(id) => <Input id={id} type="email" required disabled={!isNew} value={d.email} onChange={(e) => set({ email: e.target.value })} />}
        </Field>
        <Field label={t.users.name}>{(id) => <Input id={id} required maxLength={120} value={d.name} onChange={(e) => set({ name: e.target.value })} />}</Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t.users.role} help={t.roleHelp[d.role]}>
            {(id) => (
              <Select id={id} value={d.role} disabled={self} onChange={(e) => set({ role: e.target.value as Role })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t.roles[r]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.users.language}>
            {(id) => (
              <Select id={id} value={d.uiLang} onChange={(e) => set({ uiLang: e.target.value as UiLang })}>
                {(["cs", "en"] as UiLang[]).map((l) => (
                  <option key={l} value={l}>
                    {t.langs[l]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        {d.role === "branch_manager" && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-1">{t.users.branches}</legend>
            {branches.map((b) => (
              <Checkbox
                key={b.id}
                label={`${lang === "cs" ? b.cityCs : b.cityEn} — ${b.mall}`}
                hint={b.isPublished ? undefined : `(${t.users.unpublished})`}
                checked={d.branchIds.includes(b.id)}
                onChange={(e) =>
                  set({ branchIds: e.target.checked ? [...d.branchIds, b.id] : d.branchIds.filter((x) => x !== b.id) })
                }
              />
            ))}
            <p className="text-xs text-ink-soft">{t.users.branchesHelp}</p>
          </fieldset>
        )}
        <Field label={isNew ? t.users.password : t.users.newPassword} help={isNew ? t.users.passwordHelp : t.users.newPasswordHelp}>
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              required={isNew}
              minLength={10}
              value={d.password}
              onChange={(e) => set({ password: e.target.value })}
            />
          )}
        </Field>
        {!isNew && !self && (
          <Checkbox label={t.users.active} hint={t.users.activeHelp} checked={d.isActive} onChange={(e) => set({ isActive: e.target.checked })} />
        )}
        {save.isError && <Alert>{save.error instanceof ApiError ? save.error.message : t.somethingWrong}</Alert>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? t.saving : t.save}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function UsersPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const isAdmin = me?.role === "admin";
  const { data: users, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<AdminUser[]>("/admin/users"),
    enabled: isAdmin,
  });

  if (!me) return null;
  if (!isAdmin) return <Alert>{t.notAllowed}</Alert>;

  return (
    <div className="space-y-6">
      <PageHeader title={t.users.title} lead={t.users.lead} actions={<Button onClick={() => setEditing("new")}>+ {t.users.add}</Button>} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}

      <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink-soft border-b border-ink/10">
            <tr>
              <th className="px-4 py-3 font-medium">{t.users.name}</th>
              <th className="px-4 py-3 font-medium">{t.users.role}</th>
              <th className="px-4 py-3 font-medium">{t.users.branches}</th>
              <th className="px-4 py-3 font-medium">{t.users.status}</th>
              <th className="px-4 py-3 font-medium">{t.users.lastLogin}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {(users ?? []).map((u) => (
              <tr key={u.id} className={u.isActive ? "" : "text-ink-soft"}>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {u.name} {u.id === me.id && <span className="text-xs font-normal text-ink-soft">({t.users.you})</span>}
                  </p>
                  <p className="text-xs text-ink-soft">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === "admin" ? "green" : "neutral"}>{t.roles[u.role]}</Badge>
                </td>
                <td className="px-4 py-3 text-xs">
                  {u.role === "branch_manager" ? u.branches.map((b) => b.mall).join(", ") : <span className="text-ink-soft">{t.users.allBranches}</span>}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? "green" : "muted"}>{u.isActive ? t.users.active : t.users.inactive}</Badge>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDate(u.lastLoginAt, lang, t.never)}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="secondary" onClick={() => setEditing(u)} aria-label={`${t.users.edit}: ${u.name}`}>
                    {t.edit}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <UserDialog user={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
