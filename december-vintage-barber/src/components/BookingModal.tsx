"use client";

import { useEffect, useState } from "react";
import { BRANCHES, type Category, type Dict } from "@/app/data";
import { getLenis } from "@/lib/gsap";

const field =
  "w-full bg-transparent border-0 border-b border-ink/25 rounded-none px-0 py-2.5 text-base text-ink focus:outline-none focus:border-ink transition-colors";

export default function BookingModal({
  t,
  open,
  onClose,
  branch,
  setBranch,
  category,
  setCategory,
  note,
  setNote,
}: {
  t: Dict;
  open: boolean;
  onClose: () => void;
  branch: string;
  setBranch: (b: string) => void;
  category: Category;
  setCategory: (c: Category) => void;
  /** Pre-filled from the lookbook or the price list ("Styl: …", "Služby: …") */
  note: string;
  setNote: (n: string) => void;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open, onClose]);

  if (!open) return null;

  const close = () => {
    onClose();
    setDone(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t.modalTitle}>
      <button aria-label={t.close} onClick={close} className="absolute inset-0 bg-forest/50 cursor-default animate-[fadeIn_0.6s_ease-out]" />

      <div data-lenis-prevent className="relative h-full w-full max-w-xl bg-paper overflow-y-auto px-6 sm:px-12 py-8 flex flex-col animate-[panelIn_0.9s_cubic-bezier(0.22,1,0.36,1)]">
        <div className="flex justify-between items-center">
          <span className="font-serif text-xl">December</span>
          <button onClick={close} className="link-line text-sm cursor-pointer">
            {t.close}
          </button>
        </div>

        {done ? (
          <div className="my-auto py-16">
            <h3 className="font-serif italic text-6xl tracking-tight text-moss">{t.formDoneTitle}</h3>
            <p className="mt-6 text-lg text-ink-soft max-w-sm">{t.formDone}</p>
          </div>
        ) : (
          <div className="mt-16">
            <h3 className="font-serif text-6xl sm:text-7xl tracking-[-0.03em] leading-[0.9]">{t.modalTitle}</h3>
            <p className="mt-5 text-ink-soft max-w-sm">{t.modalBody}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
              className="mt-12 space-y-8"
            >
              <label className="block">
                <span className="label text-ink-soft">{t.formBranch}</span>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className={field}>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.city} — {b.mall}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label text-ink-soft">{t.formCategory}</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className={field}
                >
                  {(Object.keys(t.cat) as Category[]).map((c) => (
                    <option key={c} value={c}>
                      {t.cat[c]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <label className="block">
                  <span className="label text-ink-soft">{t.formName}</span>
                  <input type="text" required autoComplete="name" className={field} />
                </label>
                <label className="block">
                  <span className="label text-ink-soft">{t.formPhone}</span>
                  <input type="tel" required autoComplete="tel" className={field} />
                </label>
              </div>

              <label className="block">
                <span className="label text-ink-soft">{t.formDate}</span>
                <input type="date" required className={field} />
              </label>

              <label className="block">
                <span className="label text-ink-soft">{t.formNote}</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${field} resize-none`} />
              </label>

              <button
                type="submit"
                className="group cursor-pointer w-full flex items-center justify-between rounded-full bg-forest text-paper px-8 py-5 text-sm font-medium hover:bg-moss transition-colors duration-500"
              >
                {t.formSubmit}
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
