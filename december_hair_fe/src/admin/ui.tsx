"use client";

import { useEffect, useId, useRef } from "react";

// Small building blocks for the admin, in the site's own palette

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
        variant === "primary" && "bg-forest text-paper hover:bg-moss",
        variant === "secondary" && "border border-ink/20 text-ink hover:border-ink bg-white/60",
        variant === "ghost" && "text-ink-soft hover:text-ink hover:bg-bone/70",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-800",
        className
      )}
    />
  );
}

export function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string | null;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children(id)}
      {help && !error && <p className="text-xs text-ink-soft">{help}</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

const control =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20 disabled:bg-bone/50";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(control, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(control, "pr-8", props.className)} />;
}

export function Checkbox({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 text-sm cursor-pointer">
      <input type="checkbox" {...props} className="mt-0.5 h-4 w-4 accent-moss" />
      <span>
        {label}
        {hint && <span className="ml-1.5 text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "green" | "muted" | "warn"; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tone === "neutral" && "bg-bone text-ink",
        tone === "green" && "bg-celadon text-forest",
        tone === "muted" && "bg-ink/5 text-ink-soft",
        tone === "warn" && "bg-amber-100 text-amber-900"
      )}
    >
      {children}
    </span>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-xl px-3.5 py-2.5 text-sm",
        tone === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-celadon/70 text-forest border border-moss/20"
      )}
    >
      {children}
    </p>
  );
}

/**
 * A message that drops in at the top of the screen and leaves by itself.
 * Change `id` to show the same message again (e.g. a second failed sign-in).
 */
export function Toast({
  tone = "error",
  message,
  id,
  onClose,
  closeLabel,
  duration = 5000,
  className,
}: {
  tone?: "error" | "success";
  message: string | null;
  id?: number;
  onClose: () => void;
  closeLabel: string;
  duration?: number;
  /** Extra classes for the full-width strip, e.g. to center it over one column */
  className?: string;
}) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => close.current(), duration);
    return () => clearTimeout(timer);
  }, [message, id, duration]);

  if (!message) return null;
  return (
    <div className={cx("pointer-events-none fixed inset-x-0 top-0 z-[300] flex justify-center px-4 pt-4 sm:pt-6", className)}>
      <div
        key={id}
        role={tone === "error" ? "alert" : "status"}
        className={cx(
          "pointer-events-auto relative overflow-hidden w-full max-w-md flex items-start gap-3 rounded-2xl pl-4 pr-2 py-3 shadow-[0_18px_50px_-12px_rgba(17,38,26,0.45)] motion-safe:animate-[toastIn_0.45s_cubic-bezier(0.22,1,0.36,1)]",
          tone === "error" ? "bg-[#7a1f1f] text-paper" : "bg-forest text-paper"
        )}
      >
        <span aria-hidden className="mt-0.5 grid place-items-center shrink-0 w-5 h-5 rounded-full bg-paper/15 text-xs font-semibold">
          {tone === "error" ? "!" : "✓"}
        </span>
        <p className="flex-1 text-sm leading-snug pt-0.5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="cursor-pointer shrink-0 w-7 h-7 grid place-items-center rounded-full text-paper/70 hover:text-paper hover:bg-paper/10 transition-colors"
        >
          ✕
        </button>
        <span
          aria-hidden
          className="absolute left-4 right-4 bottom-0 h-[2px] origin-left rounded-full bg-paper/30 motion-safe:animate-[toastTimer_linear_forwards]"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

export function PageHeader({ title, lead, actions }: { title: string; lead?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-ink/10">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-[-0.02em] leading-tight">{title}</h1>
        {lead && <p className="mt-1.5 text-sm text-ink-soft">{lead}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6", className)}>{children}</div>;
}

/** A modal panel; Escape and the backdrop close it */
export function Dialog({
  open,
  title,
  onClose,
  children,
  closeLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  closeLabel: string;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    box.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      {/* type="button": a dialog can open inside another dialog's form, and must never submit it */}
      <button type="button" aria-label={closeLabel} onClick={onClose} className="absolute inset-0 bg-forest/40 cursor-default" />
      <div ref={box} className="relative w-full sm:max-w-lg max-h-[92svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-paper p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="font-serif text-2xl tracking-[-0.01em]">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-ink-soft hover:text-ink cursor-pointer">
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
