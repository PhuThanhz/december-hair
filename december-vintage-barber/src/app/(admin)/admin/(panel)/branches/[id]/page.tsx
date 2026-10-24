"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import BranchForm, { NEW_BRANCH } from "@/admin/branches/BranchForm";
import type { BranchAdmin } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, PageHeader } from "@/admin/ui";

export default function BranchPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const { id: param } = useParams<{ id: string }>();
  const isNew = param === "new";
  const id = isNew ? null : Number(param);
  const isEditor = me?.role === "admin" || me?.role === "editor";
  const { data: branch, error } = useQuery({
    queryKey: ["branches", id],
    queryFn: () => api<BranchAdmin>(`/admin/branches/${id}`),
    enabled: !!me && id !== null,
  });

  if (!me) return null;
  if (isNew && !isEditor) return <Alert>{t.notAllowed}</Alert>;

  const title = isNew ? t.cms.branches.newTitle : branch ? `${lang === "cs" ? branch.cityCs : branch.cityEn} · ${branch.mall}` : t.loading;
  return (
    <div className="space-y-6">
      <Link href="/admin/branches" className="text-sm text-ink-soft hover:text-ink">
        ← {t.cms.back}
      </Link>
      <PageHeader title={title} />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {isNew && <BranchForm id={null} initial={NEW_BRANCH} isEditor={isEditor} />}
      {branch && <BranchForm key={branch.id} id={branch.id} initial={branch} isEditor={isEditor} />}
    </div>
  );
}
