"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { fmt } from "./i18n";
import { useAdminT } from "./Providers";

// Shared pieces of the CMS list screens (services, lookbook, reels, panels):
// filtering, drag-and-drop ordering and the small controls around it

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * The order of a list, saved with `PUT {path}/order`. The list moves at once (optimistic)
 * and goes back if the save fails.
 */
export function useOrder<T extends { id: number }>(queryKey: string, path: string) {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (ids: number[]) => api(`${path}/order`, { method: "PUT", body: { ids } }),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: [queryKey] });
      const prev = qc.getQueryData<T[]>([queryKey]);
      if (prev) qc.setQueryData<T[]>([queryKey], ids.map((id) => prev.find((x) => x.id === id)).filter((x): x is T => !!x));
      return { prev };
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.prev) qc.setQueryData([queryKey], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  /** Put item `id` where `targetId` is now, in the full list (also works on a filtered view) */
  const moveTo = (all: T[], id: number, targetId: number) => {
    if (id === targetId) return;
    const ids = all.map((x) => x.id);
    const from = ids.indexOf(id);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, id);
    save.mutate(ids);
  };

  return { moveTo, saving: save.isPending, failed: save.isError };
}

/** Drag-and-drop between items of one list; touch screens use the arrow buttons instead */
export function useDragOrder(onDrop: (id: number, targetId: number) => void) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const reset = () => {
    setDragId(null);
    setOverId(null);
  };
  const itemProps = (id: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(id));
    },
    onDragOver: (e: React.DragEvent) => {
      if (dragId === null) return;
      e.preventDefault();
      if (overId !== id) setOverId(id);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId !== null && dragId !== id) onDrop(dragId, id);
      reset();
    },
    onDragEnd: reset,
  });
  /** Classes for an item while something is dragged */
  const state = (id: number) =>
    cx(dragId === id && "opacity-40 scale-[0.98]", overId === id && dragId !== id && "ring-2 ring-moss ring-offset-2 ring-offset-paper");
  return { itemProps, state, dragging: dragId !== null };
}

/** Category chips with counts, and an optional search box */
export function FilterBar<K extends string>({
  options,
  value,
  onChange,
  search,
  onSearch,
}: {
  options: { key: K | "all"; label: string; count?: number }[];
  value: K | "all";
  onChange: (k: K | "all") => void;
  search?: string;
  onSearch?: (q: string) => void;
}) {
  const { t } = useAdminT();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.key)}
              className={cx(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                on ? "bg-forest border-forest text-paper" : "border-ink/15 bg-white/60 text-ink-soft hover:border-ink/40 hover:text-ink"
              )}
            >
              {o.label}
              {o.count !== undefined && <span className={cx("ml-1.5 tabular-nums text-xs", on ? "text-paper/70" : "text-ink-soft/70")}>{o.count}</span>}
            </button>
          );
        })}
      </div>
      {onSearch && (
        <label className="relative ml-auto w-full sm:w-64">
          <span className="sr-only">{t.cms.list.search}</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.cms.list.search}
            className="w-full rounded-full border border-ink/15 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-ink-soft/60 focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
          />
        </label>
      )}
    </div>
  );
}

/** One line under the filters: how ordering works, and whether it is being saved */
export function ListHint({ saving }: { saving: boolean }) {
  const { t } = useAdminT();
  return (
    <p className="flex items-center gap-2 text-xs text-ink-soft">
      <DragIcon className="w-3.5 h-3.5 shrink-0" />
      <span>{saving ? t.cms.list.saving : t.cms.list.dragHint}</span>
      {saving && <span className="h-1.5 w-1.5 rounded-full bg-moss animate-pulse" />}
    </p>
  );
}

export function DragIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 20" className={className} fill="currentColor">
      {[4, 10, 16].map((y) => (
        <g key={y}>
          <circle cx="3.5" cy={y} r="1.4" />
          <circle cx="8.5" cy={y} r="1.4" />
        </g>
      ))}
    </svg>
  );
}

/** Position number with small up/down buttons (the way to reorder without a mouse) */
export function OrderControls({
  index,
  first,
  last,
  disabled,
  onUp,
  onDown,
  className,
}: {
  index: number;
  first: boolean;
  last: boolean;
  disabled?: boolean;
  onUp: () => void;
  onDown: () => void;
  className?: string;
}) {
  const { t } = useAdminT();
  const btn =
    "cursor-pointer grid place-items-center w-7 h-7 rounded-full text-ink-soft hover:bg-bone hover:text-ink disabled:opacity-25 disabled:cursor-default disabled:hover:bg-transparent transition-colors";
  return (
    <div className={cx("inline-flex items-center gap-0.5 rounded-full border border-ink/10 bg-white/80 p-0.5", className)}>
      <span className="px-1.5 text-[11px] font-medium tabular-nums text-ink-soft" title={fmt(t.cms.list.position, { n: String(index + 1) })}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <button type="button" aria-label={t.cms.moveUp} disabled={first || disabled} onClick={onUp} className={btn}>
        <svg aria-hidden viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" aria-label={t.cms.moveDown} disabled={last || disabled} onClick={onDown} className={btn}>
        <svg aria-hidden viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Shown only on items that are not on the site, so they stand out */
export function HiddenBadge({ className }: { className?: string }) {
  const { t } = useAdminT();
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-paper backdrop-blur", className)}>
      <svg aria-hidden viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4Z" />
        <path d="m3 13 10-10" strokeLinecap="round" />
      </svg>
      {t.cms.hidden}
    </span>
  );
}

/** Nothing to show (no items, or no match for the filter) */
export function EmptyList({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink-soft">{text}</p>;
}
