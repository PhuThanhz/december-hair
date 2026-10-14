"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pinyon_Script } from "next/font/google";
import { SERVICES, type Dict, type Lang } from "@/app/data";
import { gsap, useGSAP, EASE, MQ_MOTION, getLenis } from "@/lib/gsap";
import Magnetic from "./Magnetic";

// The hand-written "a gift for you" of the printed card
const script = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const VALUES = [1000, 3000] as const;
type Value = (typeof VALUES)[number];
const money = (n: number) => n.toLocaleString("cs-CZ");
const num = (s: string) => Number(s.replace(/\D/g, ""));

type Treat = { items: typeof SERVICES; total: number; minutes: number };

/** Every visit the voucher pays for in full and that uses most of it: one or two services from the
 *  price list. Two only go together if one person would book both: same kind of visit, or any visit
 *  plus care. Each scratch reveals one of these, so covering it again turns up a different treat. */
function treatsFor(value: number): Treat[] {
  const out: Treat[] = [];
  const add = (items: typeof SERVICES) => {
    const total = items.reduce((a, s) => a + num(s.price), 0);
    if (total <= value && total >= value * 0.6)
      out.push({
        items,
        total,
        minutes: items.reduce((a, s) => a + num(s.duration), 0),
      });
  };
  SERVICES.forEach((a, i) => {
    add([a]);
    SERVICES.slice(i + 1).forEach((b) => {
      if (
        a.category === b.category ||
        a.category === "spa" ||
        b.category === "spa"
      )
        add([a, b]);
    });
  });
  return out.sort((a, b) => b.total - a.total);
}

/** Czech-style plural: 1 / 2–4 / 5+ */
const plural = (n: number, [one, few, many]: string[]) =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

// A coin for a cursor, so a mouse knows it can scratch
const COIN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="#e9e3cf" stroke="#8a8263" stroke-width="2"/><circle cx="17" cy="17" r="10" fill="none" stroke="#b5ad8c" stroke-width="1"/><text x="17" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#5e5840">D</text></svg>',
)}") 17 17, pointer`;

/** Paints the green foil: brushed metal, a fine grain, the value embossed in the middle and the brand above it. */
function paintFoil(
  c: HTMLCanvasElement,
  w: number,
  h: number,
  value: number,
  question: string,
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return;
  const W = c.width;
  const H = c.height;
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;

  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#2c4c21");
  grad.addColorStop(0.22, "#5d8844");
  grad.addColorStop(0.42, "#35582a");
  grad.addColorStop(0.6, "#7ba65e");
  grad.addColorStop(0.8, "#3a6130");
  grad.addColorStop(1, "#28441e");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // Brushed lines
  g.globalAlpha = 0.07;
  g.strokeStyle = "#ffffff";
  g.lineWidth = dpr;
  for (let x = -H; x < W; x += 3 * dpr) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H * 0.4, H);
    g.stroke();
  }
  // Grain
  g.globalAlpha = 1;
  for (let i = 0; i < 2200; i++) {
    g.fillStyle =
      Math.random() < 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
    g.fillRect(Math.random() * W, Math.random() * H, dpr, dpr);
  }
  // Fine inner frame, like the printed card's edge
  g.strokeStyle = "rgba(244,243,238,0.28)";
  g.lineWidth = dpr;
  g.strokeRect(12 * dpr, 12 * dpr, W - 24 * dpr, H - 24 * dpr);

  // Embossed type: shadow below, light above, foil in between
  const face =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-serif-face")
      .trim() || "Georgia";
  const emboss = (text: string, x: number, y: number, depth = 1.4) => {
    g.fillStyle = "rgba(0,0,0,0.34)";
    g.fillText(text, x + depth * dpr, y + depth * dpr);
    g.fillStyle = "rgba(255,255,255,0.4)";
    g.fillText(text, x - depth * 0.8 * dpr, y - depth * 0.8 * dpr);
    g.fillStyle = "#5f8b46";
    g.fillText(text, x, y);
  };
  g.textBaseline = "middle";
  // The brand, small, top left
  g.textAlign = "left";
  g.font = `italic 400 ${Math.round(H * 0.085)}px ${face}, Georgia, serif`;
  emboss("December", 26 * dpr, 34 * dpr, 1);
  // The value, large: the buyer sees at once which card they're holding
  g.textAlign = "center";
  g.font = `400 ${Math.round(H * 0.3)}px ${face}, Georgia, serif`;
  const amount = money(value);
  const kc = "Kč";
  const aw = g.measureText(amount).width;
  g.font = `400 ${Math.round(H * 0.1)}px ${face}, Georgia, serif`;
  const kw = g.measureText(kc).width;
  const gap = 10 * dpr;
  const left = W / 2 - (aw + gap + kw) / 2;
  g.textAlign = "left";
  g.font = `400 ${Math.round(H * 0.3)}px ${face}, Georgia, serif`;
  emboss(amount, left, H * 0.44, 1.8);
  g.font = `400 ${Math.round(H * 0.1)}px ${face}, Georgia, serif`;
  emboss(kc, left + aw + gap, H * 0.5, 1);
  // The question the scratching answers
  g.textAlign = "center";
  g.font = `500 ${Math.round(H * 0.048)}px ${getComputedStyle(document.body).fontFamily}`;
  g.fillStyle = "rgba(244,243,238,0.75)";
  g.fillText(question.toUpperCase(), W / 2, H * 0.67);
}

/**
 * The voucher as a scratch card. The buyer scratches the foil off (finger on a phone, a coin
 * cursor on a laptop) and finds what the person they give it to will find: the value, and the
 * visit it pays for, taken from the price list.
 */
function ScratchCard({
  value,
  lang,
  t,
  revealed,
  onReveal,
  onCover,
}: {
  value: Value;
  lang: Lang;
  t: Dict;
  revealed: boolean;
  onReveal: () => void;
  onCover: () => void;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const face = useRef<HTMLDivElement | null>(null);
  const sparks = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);
  const done = useRef(false);
  const treats = treatsFor(value);
  // Which treat is under the foil: the fullest one first, then a different one on every new cover
  const [pick, setPick] = useState(0);
  const treat = treats[Math.min(pick, treats.length - 1)];

  const paint = useCallback(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const r = w.getBoundingClientRect();
    paintFoil(c, r.width, r.height, value, t.vWhat);
    // Stop a reveal fade still running, or it would carry on and hide the fresh foil
    gsap.killTweensOf(c);
    gsap.set(c, { autoAlpha: 1 });
    done.current = false;
    setStarted(false);
  }, [value, t.vWhat]);

  // "Cover & try another": fresh foil, and a different treat waiting under it
  const coverAgain = () => {
    paint();
    if (treats.length > 1) {
      setPick((p) => {
        let n = p;
        while (n === p) n = Math.floor(Math.random() * treats.length);
        return n;
      });
    }
    onCover();
  };

  // Fresh foil (the card is keyed by value, so a new value starts on the fullest treat), and again once the fonts are in
  useEffect(() => {
    paint();
    document.fonts?.ready.then(() => !done.current && paint());
  }, [paint]);

  // Resizing redraws the foil (only while it's still on)
  useEffect(() => {
    const w = wrap.current;
    if (!w) return;
    let last = w.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (done.current || w.offsetWidth === last) return;
      last = w.offsetWidth;
      paint();
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, [paint]);

  const reveal = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onReveal();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.to(canvas.current, {
      autoAlpha: 0,
      duration: reduce ? 0 : 0.7,
      ease: "power2.out",
    });
    if (reduce) return;
    gsap.fromTo(
      face.current,
      { scale: 0.97 },
      { scale: 1, duration: 0.9, ease: "back.out(2.2)" },
    );
    // A handful of glints thrown off the card
    const box = sparks.current;
    const r = wrap.current?.getBoundingClientRect();
    if (!box || !r) return;
    const colors = ["#f4f3ee", "#cfdec3", "#e9dcae", "#9db08f"];
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("span");
      const size = 3 + Math.random() * 6;
      s.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;margin:-${size / 2}px;border-radius:9999px;background:${colors[i % colors.length]};pointer-events:none`;
      box.appendChild(s);
      const a = Math.random() * Math.PI * 2;
      const d = 0.35 + Math.random() * 0.45;
      gsap.fromTo(
        s,
        { x: 0, y: 0, scale: 0, opacity: 1 },
        {
          x: Math.cos(a) * r.width * d,
          y: Math.sin(a) * r.height * d - 20,
          scale: 0.6 + Math.random() * 0.9,
          opacity: 0,
          duration: 0.9 + Math.random() * 0.7,
          ease: "power3.out",
          onComplete: () => s.remove(),
        },
      );
    }
  }, [onReveal]);

  // Scratching
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return;
    let down = false;
    let last: { x: number; y: number } | null = null;
    let lastCheck = 0;

    const at = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const k = c.width / r.width;
      return {
        x: (e.clientX - r.left) * k,
        y: (e.clientY - r.top) * k,
        k,
        w: r.width,
      };
    };
    const scratch = (
      a: { x: number; y: number },
      b: { x: number; y: number },
      width: number,
    ) => {
      g.globalCompositeOperation = "destination-out";
      // Fully opaque stroke: destination-out erases by the stroke's alpha (the foil's frame left it at 0.28)
      g.globalAlpha = 1;
      g.strokeStyle = "#000";
      g.lineCap = "round";
      g.lineJoin = "round";
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    };
    // Share of foil gone, sampled sparsely
    const cleared = () => {
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let gone = 0;
      let all = 0;
      for (let i = 3; i < d.length; i += 4 * 29) {
        all++;
        if (d[i] < 128) gone++;
      }
      return gone / all;
    };
    const check = (force = false) => {
      const now = performance.now();
      if (!force && now - lastCheck < 160) return;
      lastCheck = now;
      if (cleared() > 0.5) reveal();
    };

    const onDown = (e: PointerEvent) => {
      if (done.current) return;
      down = true;
      c.setPointerCapture(e.pointerId);
      const p = at(e);
      last = p;
      scratch(p, { x: p.x + 0.1, y: p.y }, Math.max(34, p.w * 0.085) * p.k);
      setStarted(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!down || !last || done.current) return;
      const p = at(e);
      scratch(last, p, Math.max(34, p.w * 0.085) * p.k);
      last = p;
      check();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      last = null;
      if (!done.current) check(true);
    };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerup", onUp);
    c.addEventListener("pointercancel", onUp);
    return () => {
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerup", onUp);
      c.removeEventListener("pointercancel", onUp);
    };
  }, [reveal]);

  return (
    <div className="w-full">
      <div
        ref={wrap}
        className="relative aspect-[8/5] w-full [container-type:inline-size] rounded-[18px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)]"
      >
        {/* What's under the foil */}
        <div
          ref={face}
          className="absolute inset-0 overflow-hidden rounded-[18px] bg-paper text-forest flex flex-col justify-between p-[6.5cqw]"
        >
          {/* The monogram, faint, like a watermark on good paper */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[4cqw] -bottom-[16cqw] font-serif italic leading-none text-outline [--stroke:rgba(63,107,44,0.16)] text-[62cqw]"
          >
            D
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[2.2cqw] rounded-[12px] border border-moss/20"
          />
          <div className="relative flex items-start justify-between">
            <span
              className={`${script.className} text-moss text-[max(15px,5.4cqw)] leading-none`}
            >
              a gift for you
            </span>
            <span className="font-serif italic text-[max(12px,3.6cqw)] leading-none text-forest">
              December
            </span>
          </div>
          {/* The surprise: what the voucher turns into */}
          <div className="relative">
            <p className="label text-ink-soft text-[max(10px,2.3cqw)]">{t.vWhat}</p>
            <p className="mt-[1.6cqw] font-serif leading-[1.02] tracking-[-0.02em] text-[7.4cqw] text-forest">
              {treat?.items.map((s, i) => (
                <span key={s.cs} className="block">
                  {i > 0 && <span className="text-moss">+ </span>}
                  {lang === "cs" ? s.cs : s.en}
                </span>
              ))}
            </p>
          </div>
          <div className="relative flex items-end justify-between gap-[3cqw] text-[max(11px,2.6cqw)] leading-snug">
            <p className="text-ink">
              <span className="font-medium">
                ≈ {treat?.minutes} {t.vTime}
              </span>
              <span className="text-ink-soft"> · {money(value)} Kč</span>
            </p>
            {/* On a narrow card the chips below already say this */}
            <p className="hidden @md:block shrink-0 text-right text-ink-soft">{t.vValid}</p>
          </div>
        </div>

        {/* The foil */}
        <canvas
          ref={canvas}
          aria-label={t.vScratchHint}
          className="absolute inset-0 h-full w-full rounded-[18px] touch-none select-none"
          style={{ cursor: COIN }}
        />

        {/* Light running across the foil, and the coin showing how it's done */}
        {!revealed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px]"
          >
            <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-soft-light animate-[v-sheen_4.5s_ease-in-out_infinite]" />
            <span
              className={`absolute left-1/2 bottom-[13%] -translate-x-1/2 flex items-center gap-2 rounded-full bg-forest/70 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-paper backdrop-blur-sm transition-opacity duration-500 ${
                started ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="relative grid h-5 w-5 place-items-center rounded-full border border-[#8a8263] bg-[#e9e3cf] font-serif text-[10px] text-[#5e5840] motion-safe:animate-[v-coin_2.6s_ease-in-out_infinite]">
                D
              </span>
              {t.vScratch}
            </span>
          </div>
        )}

        <div
          ref={sparks}
          aria-hidden
          className="pointer-events-none absolute inset-0"
        />
      </div>

      {/* A caption under the card, as in print; the reveal is a quiet word at its end */}
      <div className="mt-4 flex items-baseline justify-between gap-4 px-1 text-[13px]">
        <p className="font-serif italic text-paper/55">{t.vPreview}</p>
        <button
          type="button"
          onClick={revealed ? coverAgain : reveal}
          className="shrink-0 cursor-pointer text-paper/75 hover:text-paper transition-colors"
        >
          {revealed ? t.vAgain : t.vReveal}
        </button>
      </div>
    </div>
  );
}

export default function Voucher({
  t,
  lang,
  onBook,
}: {
  t: Dict;
  lang: Lang;
  onBook: (note: string) => void;
}) {
  const root = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState<Value>(3000);
  const [revealed, setRevealed] = useState(false);
  const onReveal = useCallback(() => setRevealed(true), []);
  const onCover = useCallback(() => setRevealed(false), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.from("[data-v-card]", {
          rotationY: -28,
          rotationX: 14,
          y: 120,
          autoAlpha: 0,
          duration: 1.8,
          ease: EASE,
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        });
        gsap.from("[data-v-title] [data-line]", {
          yPercent: 110,
          duration: 1.3,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 60%" },
        });
        gsap.from("[data-v-fade]", {
          y: 30,
          autoAlpha: 0,
          duration: 1.1,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 55%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const cardBox = useRef<HTMLDivElement | null>(null);
  const pick = (v: Value) => {
    if (v === value) return;
    setValue(v);
    setRevealed(false);
    // On phones the card sits above the values: bring it back into view to see it change
    const box = cardBox.current;
    if (box && box.getBoundingClientRect().top < 64) {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(box, { offset: -110, duration: 0.9 });
      else box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // The card jumps, so the eye goes to the change on it (on phones it may be above the fold)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      cardBox.current,
      { y: -14, rotation: -2.5, scale: 1.03 },
      {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 1,
        ease: "elastic.out(1, 0.45)",
        overwrite: true,
      },
    );
  };

  return (
    <section
      ref={root}
      id="poukazy"
      className="relative bg-forest text-paper overflow-hidden"
    >
      {/* Large faint monogram line in the background */}
      <span
        aria-hidden
        className="absolute -left-[10vw] top-1/2 -translate-y-1/2 font-serif italic text-outline [--stroke:rgba(157,176,143,0.18)] text-[42vw] leading-none select-none pointer-events-none"
      >
        D
      </span>

      {/* Soft light so the green isn't flat: behind the card, and a cooler one top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_28%_52%,rgba(125,166,94,0.22),transparent_70%),radial-gradient(45%_40%_at_85%_10%,rgba(207,222,195,0.10),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 py-28 sm:py-40 grid grid-cols-12 gap-x-5 gap-y-14 items-center">
        <div className="col-span-12 md:col-span-6 flex justify-center [perspective:1200px]">
          <div data-v-card className="w-full max-w-[560px]">
            <div ref={cardBox}>
              <ScratchCard
                key={value}
                value={value}
                lang={lang}
                t={t}
                revealed={revealed}
                onReveal={onReveal}
                onCover={onCover}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <h2
            data-v-title
            className="font-serif text-6xl sm:text-7xl lg:text-[7rem] leading-[0.9] tracking-[-0.03em]"
          >
            {t.vouchersTitle.split(" ").map((w, i) => (
              <span key={i} className="line-mask">
                <span
                  data-line
                  className={`block ${i === 1 ? "italic text-sage" : ""}`}
                >
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <p
            data-v-fade
            className="mt-7 text-lg leading-relaxed text-paper/85 max-w-md"
          >
            {t.vLead}
          </p>

          {/* The two values as tickets: the chosen one is the bright one; each says what it pays for */}
          <div
            data-v-fade
            role="radiogroup"
            aria-label={t.vPick}
            className="mt-9 grid grid-cols-2 gap-3 max-w-md"
          >
            {VALUES.map((v) => {
              const on = v === value;
              const n = treatsFor(v).length;
              const ex = `${n} ${plural(n, t.vOptions)} ${t.vOptionsTail}`;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(v)}
                  className={`relative cursor-pointer rounded-2xl border p-4 sm:p-5 text-left transition-[background-color,border-color,color,transform] duration-500 active:scale-[0.98] ${
                    on
                      ? "bg-paper text-forest border-paper shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
                      : "bg-paper/[0.04] text-paper border-paper/20 hover:border-paper/45 hover:bg-paper/[0.08]"
                  }`}
                >
                  {/* Ticket notches */}
                  <span
                    aria-hidden
                    className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-forest"
                  />
                  <span
                    aria-hidden
                    className="absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-forest"
                  />
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="font-serif text-[2.1rem] sm:text-5xl leading-none tabular-nums tracking-tight">
                      {money(v)}
                    </span>
                    <span
                      className={`text-sm ${on ? "text-ink-soft" : "text-paper/60"}`}
                    >
                      Kč
                    </span>
                  </span>
                  <span
                    className={`mt-3 block text-[12px] leading-snug ${on ? "text-ink-soft" : "text-paper/60"}`}
                  >
                    {ex}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded-full border text-[11px] transition-colors duration-500 ${
                      on
                        ? "border-moss bg-moss text-paper"
                        : "border-paper/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>

          {/* The three facts a buyer checks, set like the price list: label, dotted leader, value */}
          <dl data-v-fade className="mt-8 max-w-md text-[15px]">
            {t.vSpecs.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-3 py-1.5">
                <dt className="shrink-0 text-paper/55">{k}</dt>
                <span className="leader text-paper" aria-hidden />
                <dd className="text-right text-paper/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div data-v-fade className="mt-10">
            <Magnetic>
              <button
                onClick={() => onBook(`${t.vNote} ${money(value)} Kč`)}
                className="w-full sm:w-auto whitespace-nowrap cursor-pointer rounded-full bg-paper text-forest px-8 py-4 text-sm font-medium hover:bg-sage transition-colors duration-500"
              >
                {t.vouchersCta} · <span className="price">{money(value)} Kč</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
