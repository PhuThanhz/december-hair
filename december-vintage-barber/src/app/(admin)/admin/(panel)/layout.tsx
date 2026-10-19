"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Role, UiLang } from "@/admin/types";

const ALL: Role[] = ["admin", "editor", "branch_manager"];

// What each role finds in the menu. `href` missing = arrives in a later phase (shown as "soon")
const NAV: { key: string; href?: string; roles: Role[] }[] = [
  { key: "dashboard", href: "/admin", roles: ALL },
  { key: "content", roles: ["admin", "editor"] },
  { key: "branches", roles: ALL },
  { key: "media", roles: ["admin", "editor"] },
  { key: "seo", roles: ["admin", "editor"] },
  { key: "bookings", roles: ["admin", "branch_manager"] },
  { key: "vouchers", roles: ["admin", "branch_manager"] },
  { key: "users", href: "/admin/users", roles: ["admin"] },
  { key: "account", href: "/admin/account", roles: ALL },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useAdminT();
  const { data: me, isPending } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  // The phone menu belongs to the page it was opened on: navigating closes it
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;

  // Signed out (or the session ended): to the sign-in page, then back here
  useEffect(() => {
    if (!isPending && me === null) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [isPending, me, pathname, router]);

  const signOut = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    qc.setQueryData(["me"], null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
  };

  if (!me) {
    // The page still renders (hidden; pages show nothing without a user), so Next can check the
    // segment for instant navigation instead of finding it dropped
    return (
      <>
        <div className="min-h-screen grid place-items-center text-sm text-ink-soft">{t.loading}</div>
        <div hidden>{children}</div>
      </>
    );
  }

  const items = NAV.filter((n) => n.roles.includes(me.role));
  const nav = (
    <nav aria-label={t.brand} className="space-y-0.5">
      {items.map((n) => {
        const on = n.href === pathname;
        return n.href ? (
          <Link
            key={n.key}
            href={n.href}
            aria-current={on ? "page" : undefined}
            className={`block rounded-xl px-3 py-2 text-sm transition-colors ${on ? "bg-paper text-forest font-medium" : "text-paper/75 hover:bg-paper/10 hover:text-paper"}`}
          >
            {t.nav[n.key]}
          </Link>
        ) : (
          <span key={n.key} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-paper/35">
            {t.nav[n.key]}
            <span className="text-[10px] uppercase tracking-wider">{t.soon}</span>
          </span>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Phones: a bar with the menu toggle */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-forest text-paper px-5 h-14">
        <span className="font-serif text-xl">
          December <span className="label text-sage">Admin</span>
        </span>
        <button onClick={() => setMenuFor(menuOpen ? null : pathname)} aria-expanded={menuOpen} className="cursor-pointer text-sm">
          {menuOpen ? t.close : "Menu"}
        </button>
      </header>

      <aside
        className={`${menuOpen ? "block" : "hidden"} lg:flex flex-col gap-8 bg-forest text-paper px-4 py-6 lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="hidden lg:block px-3">
          <span className="font-serif text-2xl">December</span>
          <span className="ml-2 label text-sage">Admin</span>
        </div>
        {nav}
        <div className="mt-auto space-y-3 px-3 text-sm">
          <div className="border-t border-paper/10 pt-4">
            <p className="font-medium truncate">{me.name}</p>
            <p className="text-xs text-paper/55">{t.roles[me.role]}</p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {(["cs", "en"] as UiLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`cursor-pointer rounded-full px-2.5 py-1 ${lang === l ? "bg-paper text-forest" : "text-paper/60 hover:text-paper"}`}
              >
                {l === "cs" ? "CZ" : "EN"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noopener" className="text-paper/70 hover:text-paper">
              {t.viewSite} ↗
            </a>
            <button onClick={signOut} className="cursor-pointer text-paper/70 hover:text-paper">
              {t.signOut}
            </button>
          </div>
        </div>
      </aside>


      <main className="min-w-0 px-5 py-8 sm:px-10 sm:py-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}
