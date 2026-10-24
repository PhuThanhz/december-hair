"use client";

import { useAdminT } from "./Providers";
import { Button } from "./ui";

// Layout for the admin's longer forms (branch, settings, account): each group of fields
// sits beside a short note on what it is for, and saving lives in one bar at the bottom

/** One group of fields with its title and purpose on the left (stacked on phones) */
export function Section({ title, help, children, id }: { title: string; help?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="grid gap-4 border-b border-ink/10 py-8 first:pt-2 last:border-0 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="font-serif text-xl leading-tight">{title}</h2>
        {help && <p className="mt-1.5 text-sm text-ink-soft text-pretty">{help}</p>}
      </div>
      <div className="min-w-0 space-y-4 rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6">{children}</div>
    </section>
  );
}

/**
 * The bar at the bottom of a form: says when there is something to save,
 * offers to throw it away, and holds the save button (plus anything on the left, e.g. delete)
 */
export function SaveBar({
  dirty,
  saving,
  saved,
  onDiscard,
  submitLabel,
  left,
}: {
  dirty: boolean;
  saving: boolean;
  saved?: boolean;
  onDiscard?: () => void;
  submitLabel?: string;
  left?: React.ReactNode;
}) {
  const { t } = useAdminT();
  return (
    <div
      className={`sticky bottom-0 z-20 -mx-5 sm:-mx-10 2xl:-mx-14 mt-2 flex flex-wrap items-center gap-3 border-t px-5 sm:px-10 2xl:px-14 py-3 backdrop-blur transition-colors ${
        dirty ? "border-amber-300/70 bg-amber-50/95" : "border-ink/10 bg-paper/90"
      }`}
    >
      {left}
      <span className="mr-auto flex items-center gap-2 text-sm">
        {dirty ? (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-medium text-amber-900">{t.cms.ui.unsaved}</span>
          </>
        ) : saved ? (
          <span className="text-moss">✓ {t.saved}</span>
        ) : null}
      </span>
      {dirty && onDiscard && (
        <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
          {t.cms.ui.discard}
        </Button>
      )}
      <Button type="submit" disabled={saving || !dirty}>
        {saving ? t.saving : (submitLabel ?? t.save)}
      </Button>
    </div>
  );
}

/** Two-letter initials for an avatar */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
