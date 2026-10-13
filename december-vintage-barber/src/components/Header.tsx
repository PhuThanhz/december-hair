"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BRANCHES, SERVICES, SOCIAL, type Dict, type Lang } from "@/app/data";
import { gsap, useGSAP, getLenis } from "@/lib/gsap";
import Magnetic from "./Magnetic";

const fromPrice = Math.min(...SERVICES.map((s) => Number(s.price.replace(/\s/g, ""))));

/** "09:00 – 20:00" → is it open right now in Prague, and the next relevant time. */
function openState(hours: string) {
  const [from, to] = hours.split(/\s*[–-]\s*/);
  const now = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Prague", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const open = now >= from && now < to;
  return { open, time: open ? to : from };
}

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
  const hint = (href: string) => (t.menuHint[href.slice(1)] ?? "").replace("{price}", String(fromPrice));

  // Hide the bar while scrolling down, bring it back on the way up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Stay transparent over the hero (its clips run edge to edge); go solid once past it
      const hero = document.getElementById("top");
      setSolid(hero ? hero.getBoundingClientRect().bottom <= 64 : y > 40);
      if (!bar.current) return;
      const hide = y > last && y > 200;
      gsap.to(bar.current, { yPercent: hide ? -100 : 0, duration: 0.6, ease: "power3.out", overwrite: true });
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    const lenis = getLenis();
    window.setTimeout(() => {
      if (lenis) lenis.scrollTo(href, { duration: 1.1 });
      else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 border-b ${
          solid ? "bg-paper border-ink/10" : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <a href="#top" onClick={(e) => go(e, "#top")} data-header-brand className="flex items-end" aria-label="December Hair">
            <Image
              src="/images/logo-wordmark-ink.png"
              alt="December"
              width={886}
              height={173}
              priority
              className="h-[22px] w-auto"
            />
            <span className="ml-2 pt-1 text-[10px] leading-none tracking-[0.32em] uppercase text-ink-soft">
              Hair
            </span>
          </a>

          <div data-header-after className="flex items-center gap-4 sm:gap-6 text-sm">
            <div className="hidden sm:block">
              <LangSwitch lang={lang} setLang={setLang} />
            </div>
            <Magnetic>
              <button
                onClick={onBook}
                className="hidden sm:block cursor-pointer rounded-full bg-forest text-paper px-5 py-2.5 text-sm hover:bg-moss transition-colors duration-500"
              >
                {t.book}
              </button>
            </Magnetic>
            <button
              onClick={() => {
                setStatus(Object.fromEntries(BRANCHES.map((b) => [b.id, openState(b.hours)])));
                setOpen(true);
              }}
              aria-expanded={open}
              className="group cursor-pointer flex items-center gap-3 rounded-full border border-ink/20 pl-4 pr-3 py-2 hover:border-ink transition-colors"
            >
              <span>{t.menu}</span>
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-5 bg-ink transition-transform duration-500 group-hover:translate-x-1" />
                <span className="block h-px w-5 bg-ink transition-transform duration-500 group-hover:-translate-x-1" />
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
        className="invisible fixed inset-0 z-[70] bg-forest text-paper overflow-y-auto"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <div className="mx-auto max-w-[1600px] min-h-full px-5 sm:px-8 lg:px-12 flex flex-col">
          <div className="h-16 flex items-center justify-between">
            <span className="flex items-end">
              <Image src="/images/logo-wordmark-paper.png" alt="December" width={886} height={173} className="h-[22px] w-auto" />
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

          <div className="flex-1 grid grid-cols-12 gap-x-8 gap-y-12 content-center py-10">
            {/* Where to go, each with the one fact that helps decide */}
            <nav className="col-span-12 lg:col-span-7">
              <ul>
                {links.map((l, i) => (
                  <li key={l.href} className="overflow-hidden border-b border-paper/10">
                    <a
                      href={l.href}
                      data-menu-link
                      onClick={(e) => go(e, l.href)}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-4 sm:py-5"
                    >
                      <span className="label text-sage tabular-nums">0{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block font-serif text-4xl sm:text-5xl leading-none tracking-[-0.02em] text-paper/70 transition-colors duration-300 group-hover:text-paper">
                          {l.label}
                        </span>
                        <span className="mt-2 block text-sm text-paper/45 transition-colors duration-300 group-hover:text-sage">
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
              <p data-menu-fade className="label text-sage mb-4">{t.menuContact}</p>
              <ul className="divide-y divide-paper/10 border-y border-paper/10">
                {BRANCHES.map((b) => {
                  const st = status[b.id];
                  return (
                    <li key={b.id} data-menu-fade className="py-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-serif text-2xl">{b.city}</span>
                        {st && (
                          <span className={`flex items-center gap-2 text-xs ${st.open ? "text-sage" : "text-paper/50"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.open ? "bg-sage" : "bg-paper/30"}`} />
                            {(st.open ? t.menuOpenNow : t.menuClosedNow).replace("{time}", st.time)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-baseline justify-between gap-4 text-sm text-paper/55">
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
                onClick={() => {
                  setOpen(false);
                  onBook();
                }}
                className="mt-8 w-full cursor-pointer rounded-full bg-paper text-forest py-4 text-sm font-medium hover:bg-sage transition-colors duration-300"
              >
                {t.book} →
              </button>
            </div>
          </div>

          <div data-menu-fade className="flex items-center justify-between gap-6 border-t border-paper/10 py-6 text-sm">
            <div className="flex items-center gap-6">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="link-line">
                Instagram ↗
              </a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="link-line">
                Facebook ↗
              </a>
            </div>
            <LangSwitch lang={lang} setLang={setLang} dark />
          </div>
        </div>
      </div>
    </>
  );
}
