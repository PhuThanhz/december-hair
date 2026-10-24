"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CATEGORIES, type Category, type Dict } from "@/content/types";
import { useContent, useLang } from "@/content/ContentProvider";
import { getLenis } from "@/lib/gsap";
import { openState } from "@/lib/hours";

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
  const { branches } = useContent();
  const lang = useLang();
  const [done, setDone] = useState(false);
  // The panel only renders after a click, so reading the clock here never meets a server render
  const status = useMemo(
    () => (open ? Object.fromEntries(branches.map((b) => [b.id, openState(b)])) : {}),
    [open, branches]
  ) as Record<string, ReturnType<typeof openState>>;
  const current = branches.find((b) => b.id === branch);

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
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true" aria-label={t.modalTitle}>
      <button aria-label={t.close} onClick={close} className="absolute inset-0 bg-forest/50 cursor-default animate-[fadeIn_0.6s_ease-out]" />

      <div data-lenis-prevent className="relative h-full w-full max-w-xl bg-paper overflow-y-auto px-6 sm:px-12 py-6 sm:py-8 flex flex-col animate-[panelIn_0.9s_cubic-bezier(0.22,1,0.36,1)]">
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
          <div className="flex-1 flex flex-col mt-8 [@media(min-height:1000px)]:mt-14">
            <h3 className="font-serif text-5xl sm:text-6xl [@media(min-height:1000px)]:sm:text-7xl tracking-[-0.03em] leading-[0.9]">{t.modalTitle}</h3>
            <p className="mt-4 text-ink-soft max-w-sm [@media(min-width:640px)_and_(max-height:820px)]:hidden">{t.modalBody}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
              className="flex-1 flex flex-col mt-7 [@media(min-height:1000px)]:mt-10"
            >
              <div className="space-y-6 [@media(min-height:1000px)]:space-y-10">
                {/* Pick the salon by sight, with whether it is open right now */}
                <div>
                  <span className="label text-ink-soft">{t.formBranch}</span>
                  <div role="radiogroup" aria-label={t.formBranch} className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
                    {branches.map((b) => {
                      const on = b.id === branch;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setBranch(b.id)}
                          className={`group relative cursor-pointer text-left rounded-xl overflow-hidden aspect-[4/3] [@media(min-width:640px)_and_(max-height:820px)]:aspect-[16/10] [@media(min-height:1000px)]:aspect-[4/5] bg-forest-2 transition-[opacity,box-shadow] duration-300 ${
                            on ? "ring-2 ring-forest ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          {b.image && (
                            <Image
                              src={b.image}
                              alt=""
                              fill
                              sizes="(min-width: 640px) 160px, 30vw"
                              className={`object-cover transition-transform duration-700 ${on ? "scale-105" : "group-hover:scale-105"}`}
                            />
                          )}
                          <span className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                          {status[b.id]?.open && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8fd16a] shadow-[0_0_0_3px_rgba(17,38,26,0.45)]" />
                          )}
                          <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 text-paper">
                            <span className="block font-serif text-base sm:text-lg leading-tight">{b.city[lang]}</span>
                            <span className="block text-[10px] sm:text-[11px] text-paper/70 truncate">{b.shortName}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {current && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${status[current.id]?.open ? "bg-moss" : "bg-ink/30"}`} />
                      <span className="truncate">
                        {status[current.id]?.time &&
                          `${(status[current.id].open ? t.menuOpenNow : t.menuClosedNow).replace("{time}", status[current.id].time)} · `}
                        {current.address}
                      </span>
                    </p>
                  )}
                </div>

                {/* One tap instead of a dropdown */}
                <div>
                  <span className="label text-ink-soft">{t.formCategory}</span>
                  <div role="radiogroup" aria-label={t.formCategory} className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={category === c}
                        onClick={() => setCategory(c)}
                        className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
                          category === c ? "bg-forest border-forest text-paper" : "border-ink/20 text-ink-soft hover:border-ink/50 hover:text-ink"
                        }`}
                      >
                        {t.cat[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-5 sm:gap-x-8 gap-y-6 [@media(min-height:1000px)]:gap-y-10">
                  <label className="block">
                    <span className="label text-ink-soft">{t.formName}</span>
                    <input type="text" required autoComplete="name" className={field} />
                  </label>
                  <label className="block">
                    <span className="label text-ink-soft">{t.formPhone}</span>
                    <input type="tel" required autoComplete="tel" className={field} />
                  </label>
                  <label className="block">
                    <span className="label text-ink-soft">{t.formDate}</span>
                    <input type="date" required className={field} />
                  </label>
                  <label className="block">
                    <span className="label text-ink-soft">{t.formNote}</span>
                    {/* Grows with a note carried over from the price list */}
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={1}
                      className={`${field} resize-none [field-sizing:content] max-h-28`}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button
                  type="submit"
                  className="group cursor-pointer w-full flex items-center justify-between rounded-full bg-forest text-paper px-8 py-5 text-sm font-medium hover:bg-moss transition-colors duration-500"
                >
                  {t.formSubmit}
                  <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </button>
                {current && (
                  <p className="mt-4 text-center text-xs text-ink-soft">
                    {t.formCall}{" "}
                    <a href={`tel:${current.phoneRaw}`} className="link-line text-ink tabular-nums">
                      {current.phone}
                    </a>
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
