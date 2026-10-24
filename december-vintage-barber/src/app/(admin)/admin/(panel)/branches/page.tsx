"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/admin/api";
import type { BranchAdmin, WeeklyHours } from "@/admin/cms";
import { useAdminT, useMe } from "@/admin/Providers";
import { Alert, PageHeader } from "@/admin/ui";
import { MediaThumb } from "@/admin/MediaPicker";
import { EmptyList, HiddenBadge, ListHint, OrderControls, useDragOrder, useOrder } from "@/admin/collection";

/** "09:00–20:00" when every day is the same, else the number of differing days */
function weekLine(hours: WeeklyHours[], closed: string) {
  const fmt = (h: WeeklyHours) => (h.closed ? closed : `${h.opens}–${h.closes}`);
  const all = new Set(hours.map(fmt));
  return all.size === 1 && hours.length === 7 ? fmt(hours[0]) : [...all].join(" / ");
}

export default function BranchesPage() {
  const { t, lang } = useAdminT();
  const { data: me } = useMe();
  const isEditor = me?.role === "admin" || me?.role === "editor";
  const { data: branches = [], error } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api<BranchAdmin[]>("/admin/branches"),
    enabled: !!me,
  });
  const order = useOrder<BranchAdmin>("branches", "/admin/branches");
  const drag = useDragOrder((id, target) => order.moveTo(branches, id, target));

  if (!me) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.cms.branches.title}
        lead={isEditor ? t.cms.branches.lead : t.cms.branches.managerNote}
        actions={
          isEditor && (
            <Link href="/admin/branches/new" className="rounded-full bg-forest text-paper px-4 py-2 text-sm font-medium hover:bg-moss">
              + {t.cms.branches.add}
            </Link>
          )
        }
      />
      {error && <Alert>{error instanceof ApiError ? error.message : t.somethingWrong}</Alert>}
      {isEditor && branches.length > 1 && <ListHint saving={order.saving} />}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b, i) => (
          <li
            key={b.id}
            {...(isEditor ? drag.itemProps(b.id) : {})}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/70 transition-[opacity,transform,box-shadow] hover:shadow-[0_14px_34px_-20px_rgba(17,38,26,0.55)] ${drag.state(b.id)}`}
          >
            <Link href={`/admin/branches/${b.id}`} className="relative block aspect-[16/9] overflow-hidden bg-forest">
              {b.image ? (
                <MediaThumb media={b.image} className={`h-full w-full !rounded-none transition-transform duration-500 group-hover:scale-[1.04] ${b.isPublished ? "" : "grayscale opacity-60"}`} />
              ) : (
                <span className="grid h-full place-items-center font-serif text-4xl text-paper/30">{(lang === "cs" ? b.cityCs : b.cityEn).slice(0, 1)}</span>
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
              <span className="absolute inset-x-4 bottom-3 text-paper">
                <span className="block font-serif text-3xl leading-none">{lang === "cs" ? b.cityCs : b.cityEn}</span>
                <span className="mt-1 block text-sm text-paper/80">{b.mall}</span>
              </span>
              {!b.isPublished && <HiddenBadge className="absolute left-3 top-3" />}
              <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">
                {t.cms.edit}
              </span>
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="flex items-start gap-2 text-sm text-ink-soft">
                <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14Z" />
                  <circle cx="8" cy="6.5" r="1.6" />
                </svg>
                <span>
                  {b.street}, {b.postalCode} {b.locality}
                </span>
              </p>
              <p className="flex items-center gap-2 text-sm">
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4.5V8l2.3 1.5" strokeLinecap="round" />
                </svg>
                <span className="tabular-nums">{weekLine(b.hours, t.cms.branches.closed)}</span>
              </p>
              <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm hover:text-moss" title={t.cms.ui.call}>
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M3 2.5h2.5l1.2 3-1.6 1a7 7 0 0 0 4.4 4.4l1-1.6 3 1.2V13a1 1 0 0 1-1 1A11.5 11.5 0 0 1 2 3.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
                </svg>
                <span className="tabular-nums">{b.phone}</span>
              </a>
              {isEditor && (
                <OrderControls
                  className="mt-auto self-start"
                  index={i}
                  first={i === 0}
                  last={i === branches.length - 1}
                  disabled={order.saving}
                  onUp={() => order.moveTo(branches, b.id, branches[i - 1].id)}
                  onDown={() => order.moveTo(branches, b.id, branches[i + 1].id)}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      {!branches.length && !error && <EmptyList text={t.cms.empty} />}
    </div>
  );
}
