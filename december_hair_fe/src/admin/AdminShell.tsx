"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Scissors,
  Camera,
  Film,
  Columns3,
  Video,
  Files,
  MapPin,
  Image as ImageIcon,
  Search,
  Calendar,
  Ticket,
  Users,
  Settings,
  History,
  User,
  PanelLeft,
  ExternalLink,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { api } from "@/admin/api";
import { useAdminT, useMe } from "@/admin/Providers";
import type { Role, UiLang } from "@/admin/types";
import { Curtain, clearEntering, isEntering } from "@/admin/Curtain";

const ALL: Role[] = ["admin", "editor", "branch_manager"];

const NAV: { key: string; href?: string; roles: Role[] }[] = [
  { key: "dashboard", href: "/admin", roles: ALL },
  { key: "texts", href: "/admin/texts", roles: ["admin", "editor"] },
  { key: "services", href: "/admin/services", roles: ["admin", "editor"] },
  { key: "lookbook", href: "/admin/lookbook", roles: ["admin", "editor"] },
  { key: "reels", href: "/admin/reels", roles: ["admin", "editor"] },
  { key: "panels", href: "/admin/panels", roles: ["admin", "editor"] },
  { key: "siteMedia", href: "/admin/site-media", roles: ["admin", "editor"] },
  { key: "pages", href: "/admin/pages", roles: ["admin", "editor"] },
  { key: "branches", href: "/admin/branches", roles: ALL },
  { key: "media", href: "/admin/media", roles: ALL },
  { key: "seo", roles: ["admin", "editor"] },
  { key: "bookings", roles: ["admin", "branch_manager"] },
  { key: "vouchers", roles: ["admin", "branch_manager"] },
  { key: "users", href: "/admin/users", roles: ["admin"] },
  { key: "settings", href: "/admin/settings", roles: ["admin"] },
  { key: "activity", href: "/admin/activity", roles: ["admin"] },
  { key: "account", href: "/admin/account", roles: ALL },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  texts: FileText,
  services: Scissors,
  lookbook: Camera,
  reels: Film,
  panels: Columns3,
  siteMedia: Video,
  pages: Files,
  branches: MapPin,
  media: ImageIcon,
  seo: Search,
  bookings: Calendar,
  vouchers: Ticket,
  users: Users,
  settings: Settings,
  activity: History,
  account: User,
};

const DEFAULT_WIDTH = 250;
const MIN_WIDTH = 190;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 68;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useAdminT();
  const { data: me, isPending } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();

  // Sidebar resize & collapse state
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Mobile menu state
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;

  // First time entry curtain animation
  const [entered] = useState(isEntering);
  const [curtain, setCurtain] = useState(entered);

  useEffect(() => {
    if (entered) clearEntering();
  }, [entered]);

  // Load saved sidebar width & state from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedWidth = localStorage.getItem("admin_sidebar_width");
        if (savedWidth) {
          const parsed = parseInt(savedWidth, 10);
          if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
            setSidebarWidth(parsed);
          }
        }
        const savedCollapsed = localStorage.getItem("admin_sidebar_collapsed");
        if (savedCollapsed === "true") {
          setIsCollapsed(true);
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut: Cmd+B or Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  // Drag to resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newWidth = e.clientX;
      if (newWidth < 120) {
        setIsCollapsed(true);
        try {
          localStorage.setItem("admin_sidebar_collapsed", "true");
        } catch {}
      } else {
        const clamped = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
        setIsCollapsed(false);
        setSidebarWidth(clamped);
        try {
          localStorage.setItem("admin_sidebar_width", String(clamped));
          localStorage.setItem("admin_sidebar_collapsed", "false");
        } catch {}
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const resetWidth = () => {
    setSidebarWidth(DEFAULT_WIDTH);
    setIsCollapsed(false);
    try {
      localStorage.setItem("admin_sidebar_width", String(DEFAULT_WIDTH));
      localStorage.setItem("admin_sidebar_collapsed", "false");
    } catch {}
  };

  // Sign out redirect
  useEffect(() => {
    if (!isPending && me === null) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [isPending, me, pathname, router]);

  const signOut = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    qc.setQueryData(["me"], null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
  };

  if (!me) {
    return (
      <>
        <div className="min-h-screen grid place-items-center text-sm text-ink-soft">{t.loading}</div>
        <div hidden>{children}</div>
      </>
    );
  }

  const items = NAV.filter((n) => n.roles.includes(me.role));
  const currentItem = items.find(
    (n) => n.href === pathname || (n.href !== "/admin" && !!n.href && pathname.startsWith(`${n.href}/`))
  ) || items[0];
  const currentPageTitle = currentItem ? t.nav[currentItem.key] || currentItem.key : "Dashboard";
  const desktopWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  const nav = (
    <nav aria-label={t.brand} className="space-y-1">
      {items.map((n, i) => {
        const enter = entered ? { animation: `adminSlide 0.5s ease-out ${0.3 + i * 0.03}s both` } : undefined;
        const on = n.href === pathname || (n.href !== "/admin" && !!n.href && pathname.startsWith(`${n.href}/`));
        const Icon = ICONS[n.key] || LayoutDashboard;
        const label = t.nav[n.key] || n.key;

        return n.href ? (
          <Link
            key={n.key}
            href={n.href}
            aria-current={on ? "page" : undefined}
            style={enter}
            className={`group relative flex items-center h-10 px-3 rounded-xl transition-colors duration-200 ${
              on
                ? "bg-paper text-forest font-medium shadow-xs"
                : "text-paper/75 hover:bg-paper/10 hover:text-paper"
            }`}
          >
            {/* Fixed-size icon container for zero-shift alignment */}
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            </div>

            {/* Smoothly animated text container */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center flex-1 ${
                isCollapsed
                  ? "max-w-0 opacity-0 ml-0 pointer-events-none"
                  : "max-w-[320px] opacity-100 ml-3"
              }`}
            >
              <span className="truncate text-sm whitespace-nowrap">{label}</span>
            </div>

            {/* Floating tooltip when sidebar is collapsed */}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-forest-2 px-3 py-1.5 text-xs font-normal whitespace-nowrap text-paper shadow-2xl border border-paper/15 group-hover:block z-50">
                {label}
              </span>
            )}
          </Link>
        ) : (
          <div
            key={n.key}
            style={enter}
            className="group relative flex items-center h-10 px-3 rounded-xl text-paper/35"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 shrink-0 opacity-50" />
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-between flex-1 ${
                isCollapsed
                  ? "max-w-0 opacity-0 ml-0 pointer-events-none"
                  : "max-w-[320px] opacity-100 ml-3"
              }`}
            >
              <span className="truncate text-sm whitespace-nowrap">{label}</span>
              <span className="text-[10px] uppercase tracking-wider font-medium ml-2 shrink-0">{t.soon}</span>
            </div>

            {/* Floating tooltip when sidebar is collapsed */}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full ml-3.5 hidden rounded-lg bg-forest-2 px-3 py-1.5 text-xs font-normal whitespace-nowrap text-paper/75 shadow-2xl border border-paper/15 group-hover:block z-50">
                {label} <span className="text-[9px] text-sage font-medium uppercase ml-1">({t.soon})</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper">
      {curtain && <Curtain mode="open" onDone={() => setCurtain(false)} />}

      {/* Phones: top mobile header bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-forest text-paper px-5 h-14 border-b border-paper/10">
        <span className="font-serif text-xl">
          December <span className="label text-sage">Admin</span>
        </span>
        <button
          onClick={() => setMenuFor(menuOpen ? null : pathname)}
          aria-expanded={menuOpen}
          className="cursor-pointer text-sm px-3 py-1 rounded-lg bg-paper/10 hover:bg-paper/20 transition-colors"
        >
          {menuOpen ? t.close : "Menu"}
        </button>
      </header>

      {/* Sidebar with smooth width transition */}
      <aside
        style={{
          width: menuOpen ? "100%" : `${desktopWidth}px`,
        }}
        className={`${
          menuOpen ? "block" : "hidden"
        } lg:flex flex-col bg-forest text-paper lg:sticky lg:top-0 lg:h-screen shrink-0 relative overflow-hidden ${
          isDragging
            ? "transition-none select-none"
            : "transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        }`}
      >
        <div className="h-full flex flex-col justify-between py-4 px-3 overflow-y-auto overflow-x-hidden">
          {/* Header & Logo (Pure brand aesthetic, no clunky buttons) */}
          <div className="space-y-4">
            <div className="flex items-center h-12 px-2 border-b border-paper/10">
              <div
                className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center ${
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[240px] opacity-100"
                }`}
              >
                <span className="font-serif text-2xl whitespace-nowrap">December</span>
                <span className="ml-2 label text-sage text-xs whitespace-nowrap">Admin</span>
              </div>

              {/* Collapsed Monogram: clickable to expand */}
              {isCollapsed && (
                <div className="w-full flex justify-center">
                  <button
                    onClick={toggleCollapse}
                    title={lang === "cs" ? "Rozbalit nabídku" : "Expand menu"}
                    className="font-serif text-2xl text-paper hover:text-sage transition-colors cursor-pointer p-1 rounded-lg hover:bg-paper/10"
                  >
                    D
                  </button>
                </div>
              )}
            </div>

            {/* Navigation links */}
            {nav}
          </div>

          {/* Minimalist Bottom Brand Mark */}
          <div className="pt-3 border-t border-paper/10 text-center">
            {!isCollapsed ? (
              <p className="text-[11px] text-paper/40 font-mono tracking-wider uppercase">
                Praha · Kladno · Mladá Boleslav
              </p>
            ) : (
              <span className="text-[10px] text-paper/30 font-serif">·</span>
            )}
          </div>
        </div>

        {/* Desktop Resize Drag Handle on the right edge */}
        <div
          onMouseDown={startDragging}
          onDoubleClick={resetWidth}
          title={
            lang === "cs"
              ? "Tažením myši upravte šířku · Dvojklikem obnovte výchozí (250 px)"
              : "Drag to resize · Double click to reset (250px)"
          }
          className={`hidden lg:block absolute top-0 -right-1 w-3 h-full cursor-col-resize select-none z-30 group ${
            isDragging ? "bg-sage/40" : "hover:bg-sage/20"
          }`}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 right-[2px] w-[3px] h-9 rounded-full transition-all duration-150 ${
              isDragging
                ? "bg-sage scale-y-125"
                : "bg-paper/20 group-hover:bg-paper/80 group-hover:scale-y-110"
            }`}
          />
        </div>
      </aside>

      {/* Main Container with Top Header */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Elegant Top Header */}
        <header className="hidden lg:flex h-14 sticky top-0 z-20 bg-paper/85 backdrop-blur-md border-b border-ink/8 px-8 items-center justify-between">
          {/* Left: Sidebar Toggle Button + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={toggleCollapse}
              title={
                isCollapsed
                  ? lang === "cs"
                    ? "Rozbalit postranní panel (Ctrl+B)"
                    : "Expand sidebar (Ctrl+B)"
                  : lang === "cs"
                  ? "Sbalit postranní panel (Ctrl+B)"
                  : "Collapse sidebar (Ctrl+B)"
              }
              className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              <PanelLeft
                className={`h-4 w-4 transition-transform duration-300 ${
                  isCollapsed ? "text-forest" : "text-ink-soft"
                }`}
              />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center text-xs">
              <span className="text-ink-soft/60">December Admin</span>
              <ChevronRight className="h-3 w-3 text-ink-soft/40 mx-1.5" />
              <span className="font-medium text-ink">{currentPageTitle}</span>
            </div>
          </div>

          {/* Right: View Site, Language Switcher, User & Sign Out */}
          <div className="flex items-center gap-4">
            {/* View live site link */}
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink hover:bg-ink/5 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span>{t.viewSite}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-ink/5 p-0.5 rounded-full text-xs">
              {(["cs", "en"] as UiLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs transition-all ${
                    lang === l
                      ? "bg-white text-forest font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l === "cs" ? "CZ" : "EN"}
                </button>
              ))}
            </div>

            {/* User Pill & Sign Out */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-ink/10">
              <div
                className="w-7 h-7 rounded-full bg-forest text-paper flex items-center justify-center text-xs font-semibold shrink-0 cursor-default"
                title={`${me.name} (${t.roles[me.role]})`}
              >
                {me.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs leading-tight">
                <p className="font-medium text-ink truncate max-w-[120px]">{me.name}</p>
                <p className="text-[10px] text-ink-soft/70">{t.roles[me.role]}</p>
              </div>
              <button
                onClick={signOut}
                title={t.signOut}
                className="p-1.5 rounded-lg text-ink-soft hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer ml-1"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className={`min-w-0 flex-1 px-5 py-8 sm:px-10 sm:py-10 2xl:px-14 max-w-[1800px] mx-auto w-full ${
            entered ? "animate-[adminRise_0.7s_cubic-bezier(0.22,1,0.36,1)_0.45s_both]" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
