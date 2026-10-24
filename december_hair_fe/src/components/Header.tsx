"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Dict, Lang } from "@/content/types";
import { useContent } from "@/content/ContentProvider";
import { openState } from "@/lib/hours";
import { czk } from "@/lib/format";
import { gsap, useGSAP, getLenis } from "@/lib/gsap";
import { isNavigating, scrollToSection, JUMP_EVENT, type SectionJump } from "@/lib/scroll";
import Magnetic from "./Magnetic";

// The sections reachable from the bar, top to bottom
const SECTIONS = ["sluzby", "cenik", "salon", "poukazy", "pobocky"] as const;

function LangSwitch({ lang, setLang, dark = false }: { lang: Lang; setLang: (l: Lang) => void; dark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs tracking-wider">
      {(["cs", "en"] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className={dark ? "text-paper/30" : "text-chrome"}>/</span>}
          <button
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`cursor-pointer transition-colors ${
              lang === l ? (dark ? "text-paper" : "text-ink") : dark ? "text-paper/40 hover:text-paper" : "text-ink-soft/60 hover:text-ink"
            }`}
          >
            {l === "cs" ? "CZ" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}

export default function Header({
  t,
  lang,
  setLang,
  onBook,
}: {
  t: Dict;
  lang: Lang;
  setLang: (l: Lang) => void;
  onBook: () => void;
}) {
  const { branches, services, social } = useContent();
  const fromPrice = services.length ? czk(Math.min(...services.map((s) => s.price))) : "";
  const bar = useRef<HTMLElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  // Opening hours depend on the clock, so they are worked out on the client when the menu opens
  const [status, setStatus] = useState<Record<string, { open: boolean; time: string }>>({});

  const links = [
    { href: "#sluzby", label: t.navServices },
    { href: "#cenik", label: t.navPrices },
    { href: "#salon", label: t.navWork },
    { href: "#poukazy", label: t.navVouchers },
    { href: "#pobocky", label: t.navBranches },
  ];
  const hint = (href: string) => (t.menuHint[href.slice(1)] ?? "").replace("{price}", fromPrice);

  // The section on screen right now, lit in the bar
  const [current, setCurrent] = useState<string | null>(null);

  // Header is always visible (Always Sticky). Update solid backdrop on scroll.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setSolid(window.scrollY > 20);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Scroll-spy: whichever section crosses the middle of the screen. It changes only once the
  // section has settled for a moment, so a fast scroll doesn't flick the marker through every
  // link; and during a jump picked from the page it stays on the destination.
  useEffect(() => {
    const seen = new Map<string, boolean>();
    let spied: string | null = null;
    let lockedUntil = 0;
    let settle = 0;
    const apply = (delay: number) => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (performance.now() >= lockedUntil) setCurrent(spied);
      }, delay);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        // Lowest section still crossing the middle (two can overlap the band at a boundary)
        spied = SECTIONS.filter((id) => seen.get(id)).pop() ?? null;
        apply(180);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onJump = (e: Event) => {
      const { id, ms } = (e as CustomEvent<SectionJump>).detail;
      setCurrent(id);
      // The bar goes solid as a jump starts, so it reads over the colour the page dips into
      if (ms) setSolid(true);
      lockedUntil = performance.now() + ms + 100;
      apply(ms + 150);
    };
    window.addEventListener(JUMP_EVENT, onJump);
    return () => {
      io.disconnect();
      window.clearTimeout(settle);
      window.removeEventListener(JUMP_EVENT, onJump);
    };
  }, []);

  // One marker glides under the lit link in the bar (rather than one line shrinking as another grows)
  const navList = useRef<HTMLUListElement | null>(null);
  const [marker, setMarker] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const link = current ? navList.current?.querySelector<HTMLElement>(`a[href="#${current}"]`) : null;
    // 12px each side: the link's own padding, so the line runs under the word only
    if (link?.offsetParent) setMarker({ x: link.offsetLeft + 12, w: link.offsetWidth - 24 });
  }, [current, lang]);

  // Full-screen menu: a quick curtain, then the links rise; usable in about half a second
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .set(menu.current, { visibility: "visible" })
        .fromTo(menu.current, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power3.inOut" })
        .fromTo("[data-menu-link]", { yPercent: 100 }, { yPercent: 0, duration: 0.6, stagger: 0.04 }, 0.15)
        .fromTo("[data-menu-fade]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 }, 0.25);
    },
    { scope: menu }
  );

  const wasOpen = useRef(false);
  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (open) {
      getLenis()?.stop();
      t.timeScale(1).play();
    } else if (wasOpen.current) {
      // Only on a real close — never on mount, while the intro still holds the scroll
      getLenis()?.start();
      t.timeScale(2).reverse();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Straight from the bar: glide there and leave the address pointing at the section, so it can be shared
  const goTo = (href: string) => {
    window.history.replaceState(null, "", href === "#top" ? window.location.pathname + window.location.search : href);
    scrollToSection(href);
  };
  const jump = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    goTo(href);
  };

  // From the full-screen menu: let the curtain start lifting first
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => goTo(href), 120);
  };
  const bookFromMenu = () => {
    setOpen(false);
    onBook();
  };

  return (
    <>
      <header
        ref={bar}
        data-site-header
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300 border-b ${
          solid ? "bg-paper/95 backdrop-blur-md border-ink/10 shadow-xs" : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
          <a href="#top" onClick={(e) => jump(e, "#top")} data-header-brand className="flex shrink-0 items-end" aria-label="December Hair">
            <Image
              src="/images/logo-wordmark-ink.png"
              alt="December"
              // Its rendered size (22px tall), so the srcset is 1x/2x of that rather than of the source
              width={113}
              height={22}
              priority
              className="h-[22px] w-auto"
            />
            <span className="ml-2 pt-1 text-[10px] leading-none tracking-[0.32em] uppercase text-ink-soft">
              Hair
            </span>
          </a>

          {/* Desktop: every section one click away, no menu to open */}
          <nav data-header-after aria-label={t.menu} className="hidden lg:block">
            <ul ref={navList} className="relative flex items-center xl:gap-2">
              {links.map((l) => {
                const on = current === l.href.slice(1);
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => jump(e, l.href)}
                      aria-current={on ? "location" : undefined}
                      className={`relative block whitespace-nowrap px-3 py-2 text-sm transition-colors duration-500 ${
                        on ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
              <li
                aria-hidden
                className={`pointer-events-none absolute left-0 bottom-1 h-px origin-left bg-ink transition-[transform,width,opacity] duration-700 ease-[var(--ease-out-quint)] ${
                  current && marker ? "opacity-100" : "opacity-0"
                }`}
                style={{ width: marker?.w ?? 0, transform: `translateX(${marker?.x ?? 0}px)` }}
              />
            </ul>
          </nav>

          <div data-header-after className="flex shrink-0 items-center gap-2.5 sm:gap-6 text-sm">
            <div className="hidden sm:block lg:hidden xl:block">
              <LangSwitch lang={lang} setLang={setLang} />
            </div>
            <Magnetic>
              <button
                onClick={onBook}
                className="cursor-pointer whitespace-nowrap rounded-full bg-forest text-paper px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-medium hover:bg-moss active:scale-95 transition-all duration-300 shadow-sm"
              >
                {t.book}
              </button>
            </Magnetic>
            <button
              onClick={() => {
                setStatus(Object.fromEntries(branches.map((b) => [b.id, openState(b)])));
                setOpen(true);
              }}
              aria-expanded={open}
              className="group cursor-pointer flex items-center gap-2 sm:gap-3 rounded-full border border-ink/20 px-3 py-1.5 sm:pl-4 sm:pr-3 sm:py-2 text-xs sm:text-sm hover:border-ink transition-colors"
            >
              <span>{t.menu}</span>
              <span className="flex flex-col gap-[4px] sm:gap-[5px]">
                <span className="block h-px w-4 sm:w-5 bg-ink transition-transform duration-500 group-hover:translate-x-1" />
                <span className="block h-px w-4 sm:w-5 bg-ink transition-transform duration-500 group-hover:-translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen navigation */}
      <div
        ref={menu}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={t.menu}
        className="invisible fixed inset-0 z-[110] bg-forest text-paper overflow-y-auto"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <div className="mx-auto max-w-[1600px] min-h-full px-5 sm:px-8 lg:px-12 flex flex-col">
          <div className="h-16 flex items-center justify-between">
            <span className="flex items-end">
              <Image src="/images/logo-wordmark-paper.png" alt="December" width={113} height={22} className="h-[22px] w-auto" />
              <span className="ml-2 pt-1 text-[10px] tracking-[0.32em] uppercase text-paper/60">Hair</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="group cursor-pointer flex items-center gap-3 rounded-full border border-paper/25 pl-4 pr-3 py-2 text-sm hover:border-paper transition-colors"
            >
              <span>{t.close}</span>
              <span className="relative block w-5 h-5">
                <span className="absolute top-1/2 left-0 h-px w-5 bg-paper rotate-45 transition-transform duration-500 group-hover:rotate-[135deg]" />
                <span className="absolute top-1/2 left-0 h-px w-5 bg-paper -rotate-45 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </button>
          </div>

          {/* On a phone everything fits one screen: short links, one line per salon, booking pinned below */}
          <div className="flex-1 grid grid-cols-12 lg:gap-x-8 gap-y-6 lg:gap-y-12 content-center py-4 lg:py-10">
            {/* Where to go, each with the one fact that helps decide */}
            <nav className="col-span-12 lg:col-span-7">
              <ul>
                {links.map((l, i) => (
                  <li key={l.href} className="overflow-hidden border-b border-paper/10">
                    <a
                      href={l.href}
                      data-menu-link
                      onClick={(e) => go(e, l.href)}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-3 sm:py-5"
                    >
                      <span className="label text-sage tabular-nums">0{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block font-serif text-[2rem] sm:text-5xl leading-none tracking-[-0.02em] text-paper/70 transition-colors duration-300 group-hover:text-paper">
                          {l.label}
                        </span>
                        <span className="mt-2 hidden sm:block text-sm text-paper/45 transition-colors duration-300 group-hover:text-sage">
                          {hint(l.href)}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="text-xl text-paper/30 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-paper"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* The salons: open right now? one tap to call */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9 self-center">
              <p data-menu-fade className="label text-sage mb-2 lg:mb-4">{t.menuContact}</p>
              <ul className="divide-y divide-paper/10 border-y border-paper/10">
                {branches.map((b) => {
                  const st = status[b.id];
                  const stText = st ? (st.open ? t.menuOpenNow : t.menuClosedNow).replace("{time}", st.time) : "";
                  return (
                    <li key={b.id} data-menu-fade className="py-3 lg:py-4">
                      <div className="flex items-center lg:items-baseline justify-between gap-4">
                        <span className="flex min-w-0 items-center gap-2.5 font-serif text-xl lg:text-2xl">
                          {/* Phones: open or closed as a dot only */}
                          {st && (
                            <span aria-hidden className={`lg:hidden w-1.5 h-1.5 shrink-0 rounded-full ${st.open ? "bg-sage" : "bg-paper/30"}`} />
                          )}
                          <span className="truncate">{b.city[lang]}</span>
                          {st && <span className="sr-only lg:hidden">, {stText}</span>}
                        </span>
                        {st && (
                          <span className={`hidden lg:flex items-center gap-2 text-xs ${st.open ? "text-sage" : "text-paper/50"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.open ? "bg-sage" : "bg-paper/30"}`} />
                            {stText}
                          </span>
                        )}
                        <a href={`tel:${b.phoneRaw}`} className="lg:hidden shrink-0 tabular-nums text-sm text-paper/80 hover:text-paper">
                          {b.phone}
                        </a>
                      </div>
                      <div className="mt-1 hidden lg:flex items-baseline justify-between gap-4 text-sm text-paper/55">
                        <span className="truncate">{b.mall}</span>
                        <a href={`tel:${b.phoneRaw}`} className="shrink-0 tabular-nums text-paper/80 hover:text-paper">
                          {b.phone}
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                data-menu-fade
                onClick={bookFromMenu}
                className="hidden lg:block mt-8 w-full cursor-pointer rounded-full bg-paper text-forest py-4 text-sm font-medium hover:bg-sage transition-colors duration-300"
              >
                {t.book} →
              </button>
            </div>
          </div>

          {/* Phones: pinned to the bottom, so booking and the language never need a scroll */}
          <div
            data-menu-fade
            className="sticky lg:static bottom-0 -mx-5 sm:-mx-8 lg:mx-0 px-5 sm:px-8 lg:px-0 bg-forest border-t border-paper/10 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:py-6 text-sm"
          >
            <button
              onClick={bookFromMenu}
              className="lg:hidden mb-4 w-full cursor-pointer rounded-full bg-paper text-forest py-3.5 text-sm font-medium hover:bg-sage transition-colors duration-300"
            >
              {t.book} →
            </button>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                  Instagram ↗
                </a>
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="link-line">
                  Facebook ↗
                </a>
              </div>
              <LangSwitch lang={lang} setLang={setLang} dark />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
