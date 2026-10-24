"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import { formatDate } from "@/admin/i18n";
import { useAdminT, useMe } from "@/admin/Providers";
import { ROLES, type AdminUser, type BranchOption, type Role, type UiLang } from "@/admin/types";
import { Alert, Badge, Button, Checkbox, Dialog, Field, Input, PageHeader, Select } from "@/admin/ui";
import { initials } from "@/admin/form-kit";

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

      {/* One row per person; on phones the columns fold under the name */}
      <ul className="overflow-hidden rounded-2xl border border-ink/10 bg-white/70 divide-y divide-ink/5">
        <li className="hidden md:grid grid-cols-[minmax(0,1.6fr)_9rem_minmax(0,1fr)_7rem_10rem_auto] gap-4 bg-bone/40 px-5 py-2.5 text-[11px] uppercase tracking-wider text-ink-soft">
          <span>{t.users.name}</span>
          <span>{t.users.role}</span>
          <span>{t.users.branches}</span>
          <span>{t.users.status}</span>
          <span>{t.users.lastLogin}</span>
          <span className="w-16" />
        </li>
        {(users ?? []).map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => setEditing(u)}
              aria-label={`${t.users.edit}: ${u.name}`}
              className="group grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.6fr)_9rem_minmax(0,1fr)_7rem_10rem_auto] items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3.5 text-left text-sm transition-colors hover:bg-bone/40"
            >
              <span className="col-span-2 md:col-span-1 flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-medium ${u.isActive ? "bg-forest text-paper" : "bg-ink/10 text-ink-soft"}`}
                >
                  {initials(u.name)}
                </span>
                <span className="min-w-0">
                  <span className={`block truncate font-medium ${u.isActive ? "" : "text-ink-soft line-through decoration-ink/30"}`}>
                    {u.name} {u.id === me.id && <span className="text-xs font-normal text-ink-soft no-underline">({t.users.you})</span>}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">{u.email}</span>
                </span>
              </span>
              <span className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto justify-self-end md:justify-self-start">
                <Badge tone={u.role === "admin" ? "green" : "neutral"}>{t.roles[u.role]}</Badge>
              </span>
              <span className="col-span-3 md:col-span-1 pl-[3.25rem] md:pl-0 text-xs text-ink-soft truncate">
                {u.role === "branch_manager" ? u.branches.map((b) => b.mall).join(", ") : t.users.allBranches}
              </span>
              <span className="hidden md:flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${u.isActive ? "bg-moss" : "bg-ink/25"}`} />
                {u.isActive ? t.users.active : t.users.inactive}
              </span>
              <span className="col-span-3 md:col-span-1 pl-[3.25rem] md:pl-0 text-xs text-ink-soft tabular-nums">
                <span className="md:hidden">{t.users.lastLogin}: </span>
                {formatDate(u.lastLoginAt, lang, t.never)}
              </span>
              <span className="hidden md:inline w-16 text-right text-xs font-medium text-ink-soft opacity-0 transition-opacity group-hover:opacity-100">{t.edit} →</span>
            </button>
          </li>
        ))}
      </ul>

      {editing && <UserDialog user={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
