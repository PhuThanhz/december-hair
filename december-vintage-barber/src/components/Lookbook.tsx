"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { type Category, type Dict, type Lang } from "@/app/data";
import { useInView } from "@/lib/useInView";

export interface PortfolioItem {
  id: number;
  src: string;
  cs: string;
  en: string;
  service: string;
  category: Category;
  duration: string;
  price: string;
  from?: boolean;
}

// 18 authentic salon looks
const EXTENDED_LOOKS: PortfolioItem[] = [
  {
    id: 1,
    src: "/images/women-blonde-waves.webp",
    cs: "Blond vlny",
    en: "Blonde waves",
    service: "Balayage",
    category: "women",
    duration: "180 min",
    price: "2 490",
    from: true,
  },
  {
    id: 2,
    src: "/images/men-hair-tattoo.webp",
    cs: "Fade s ornamentem",
    en: "Hair tattoo fade",
    service: "Fade a úprava vousů",
    category: "men",
    duration: "50 min",
    price: "790",
  },
  {
    id: 3,
    src: "/images/women-layered-copper.webp",
    cs: "Vrstvený střih",
    en: "Layered cut",
    service: "Střih a foukaná",
    category: "women",
    duration: "60 min",
    price: "890",
  },
  {
    id: 4,
    src: "/images/men-classic-fade.jpg",
    cs: "Klasický pánský fade",
    en: "Classic gentleman's fade",
    service: "Pánský střih",
    category: "men",
    duration: "35 min",
    price: "490",
  },
  {
    id: 5,
    src: "/images/men-lilac-fade.webp",
    cs: "Lila fade",
    en: "Lilac fade",
    service: "Barvení a melír",
    category: "men",
    duration: "120 min",
    price: "1 890",
    from: true,
  },
  {
    id: 6,
    src: "/images/color-copper-mullet.webp",
    cs: "Měděné konce",
    en: "Copper tips",
    service: "Barvení a melír",
    category: "women",
    duration: "120 min",
    price: "1 890",
    from: true,
  },
  {
    id: 7,
    src: "/images/men-skin-fade-beard.webp",
    cs: "Skin fade a vousy",
    en: "Skin fade & beard",
    service: "Fade a úprava vousů",
    category: "men",
    duration: "50 min",
    price: "790",
  },
  {
    id: 8,
    src: "/images/haircut-kid-fade.png",
    cs: "Klučičí fade",
    en: "Boys' fade",
    service: "Dětský střih",
    category: "kids",
    duration: "30 min",
    price: "390",
  },
  {
    id: 9,
    src: "/images/care-olaplex-blonde.webp",
    cs: "Olaplex péče",
    en: "Olaplex care",
    service: "Head spa",
    category: "spa",
    duration: "60 min",
    price: "1 290",
  },
  {
    id: 10,
    src: "/images/men-textured-taper.webp",
    cs: "Texturovaný taper",
    en: "Textured taper",
    service: "Pánský střih",
    category: "men",
    duration: "35 min",
    price: "490",
  },
  {
    id: 11,
    src: "/images/showcase-balayage-curls.png",
    cs: "Balayage lokny",
    en: "Balayage curls",
    service: "Balayage",
    category: "women",
    duration: "180 min",
    price: "2 490",
    from: true,
  },
  {
    id: 12,
    src: "/images/barber-scissor-cut.webp",
    cs: "Klasický střih nůžkami",
    en: "Classic scissor cut",
    service: "Pánský střih",
    category: "men",
    duration: "35 min",
    price: "490",
  },
  {
    id: 13,
    src: "/images/stylist-haircut-action.png",
    cs: "Krátký pánský střih",
    en: "Short men's cut",
    service: "Pánský střih",
    category: "men",
    duration: "35 min",
    price: "490",
  },
  {
    id: 14,
    src: "/images/haircut-fade-tattoo-pattern.png",
    cs: "Vzor břitvou na míru",
    en: "Razor hair design",
    service: "Fade a úprava vousů",
    category: "men",
    duration: "50 min",
    price: "790",
  },
  {
    id: 15,
    src: "/images/service-hair-styling-iron.png",
    cs: "Foukaná a styling",
    en: "Blow-dry & styling",
    service: "Střih a foukaná",
    category: "women",
    duration: "60 min",
    price: "890",
  },
  {
    id: 16,
    src: "/images/service-hair-wash-massage.png",
    cs: "Masáž hlavy a mytí",
    en: "Wash & head massage",
    service: "Mytí a masáž hlavy",
    category: "spa",
    duration: "30 min",
    price: "450",
  },
  {
    id: 17,
    src: "/images/treatment-steaming-rinse.png",
    cs: "Parní lázeň vlasů",
    en: "Steam scalp treatment",
    service: "Head spa",
    category: "spa",
    duration: "60 min",
    price: "1 290",
  },
  {
    id: 18,
    src: "/images/salon-wash-stations.png",
    cs: "Rituál hloubkové péče",
    en: "Deep care ritual",
    service: "Head spa",
    category: "spa",
    duration: "60 min",
    price: "1 290",
  },
];

type FilterKey = "all" | "women" | "men" | "care";

export default function Lookbook({
  t,
  lang,
  onBook,
}: {
  t: Dict;
  lang: Lang;
  onBook: (c: Category, note: string) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [spotlightItem, setSpotlightItem] = useState<PortfolioItem | null>(null);
  // The two endless rows only run while the section is on screen
  const rows = useRef<HTMLDivElement | null>(null);
  const rowsInView = useInView(rows);

  // Filtered items based on active tab
  const filteredItems = useMemo(() => {
    if (filter === "all") return EXTENDED_LOOKS;
    if (filter === "women") return EXTENDED_LOOKS.filter((it) => it.category === "women");
    if (filter === "men") return EXTENDED_LOOKS.filter((it) => it.category === "men");
    if (filter === "care") return EXTENDED_LOOKS.filter((it) => it.category === "kids" || it.category === "spa");
    return EXTENDED_LOOKS;
  }, [filter]);

  // Distribute items into 2 smooth staggered rows (2 tầng)
  const { row1, row2 } = useMemo(() => {
    const r1: PortfolioItem[] = [];
    const r2: PortfolioItem[] = [];

    filteredItems.forEach((item, idx) => {
      if (idx % 2 === 0) r1.push(item);
      else r2.push(item);
    });

    return {
      row1: r1.length > 0 ? r1 : filteredItems,
      row2: r2.length > 0 ? r2 : filteredItems,
    };
  }, [filteredItems]);

  const name = (item: PortfolioItem) => (lang === "cs" ? item.cs : item.en);

  const bookLook = (item: PortfolioItem) => {
    onBook(item.category, `${t.lookStyle}: ${name(item)} (${item.service})`);
  };

  const closeSpotlight = useCallback(() => setSpotlightItem(null), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!spotlightItem) return;
      if (e.key === "Escape") closeSpotlight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spotlightItem, closeSpotlight]);

  const filterTabs = [
    { key: "all" as const, label: lang === "cs" ? "Vše (18)" : "All (18)" },
    { key: "women" as const, label: lang === "cs" ? "Dámské & Balayage" : "Women & Balayage" },
    { key: "men" as const, label: lang === "cs" ? "Pánský salon & Fade" : "Men & Fade" },
    { key: "care" as const, label: lang === "cs" ? "Péče & Děti" : "Care & Kids" },
  ];

  // Pure, photo-first card with NO text on card by default. Beautiful big rounded photos!
  const renderCard = (item: PortfolioItem, keyPrefix: string, idx: number) => (
    <div
      key={`${keyPrefix}-${item.id}-${idx}`}
      onClick={() => setSpotlightItem(item)}
      className="group relative shrink-0 mx-2.5 sm:mx-3.5 rounded-2xl sm:rounded-3xl overflow-hidden bg-bone border border-forest/15 shadow-sm hover:shadow-lg hover:border-moss transition-[box-shadow,border-color] duration-500 cursor-pointer select-none w-[220px] sm:w-[280px] lg:w-[330px] h-[180px] sm:h-[230px] lg:h-[260px]"
    >
      <Image
        src={item.src}
        alt={name(item)}
        fill
        sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Subtle hover overlay only appearing when hovered */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 sm:p-5 flex flex-col justify-end text-paper pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-sage font-medium block">
          {item.service}
        </span>
        <h4 className="font-serif italic text-lg sm:text-xl text-paper leading-tight mt-0.5 truncate">
          {name(item)}
        </h4>
        <div className="mt-1.5 flex items-center justify-between text-xs pt-1.5 border-t border-paper/20">
          <span className="text-paper/90 font-mono text-[11px]">
            {item.from ? `${t.servicesFrom} ` : ""}{item.price} Kč
          </span>
          <span className="text-sage text-[11px] font-medium">
            {lang === "cs" ? "Detail" : "View"} →
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section id="salon" className="relative bg-paper py-20 sm:py-24 overflow-hidden border-t border-forest/10">
      {/* Editorial Luxury Header (clean, uncluttered, magazine-style) */}
      <div className="mx-auto max-w-4xl px-5 text-center">
        <h2 className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] text-forest tracking-[-0.03em] leading-[0.95]">
          {lang === "cs" ? (
            <>
              Naše práce <span className="font-serif italic text-moss font-normal">v křesle</span>
            </>
          ) : (
            <>
              Our Craft <span className="font-serif italic text-moss font-normal">in the Chair</span>
            </>
          )}
        </h2>


        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  active
                    ? "bg-forest text-paper shadow-sm scale-102"
                    : "bg-[#ece9df] text-ink-soft hover:text-ink hover:bg-[#e4e0d4]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Infinite Running Rows of Big Pure Photos (2 tầng thoáng đãng, tinh tế, không rối mắt) */}
      <div ref={rows} className="mt-10 sm:mt-12 relative w-full overflow-hidden space-y-4 sm:space-y-5">
        {/* Left & Right gradient vignette fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-paper via-paper/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-paper via-paper/90 to-transparent z-20" />

        {/* Row 1: Running Left */}
        <Marquee
          direction="left"
          speed={32}
          play={rowsInView}
          pauseOnHover={true}
          autoFill={true}
          className="overflow-hidden py-1"
        >
          {row1.map((item, idx) => renderCard(item, "r1", idx))}
        </Marquee>

        {/* Row 2: Running Right */}
        <Marquee
          direction="right"
          speed={35}
          play={rowsInView}
          pauseOnHover={true}
          autoFill={true}
          className="overflow-hidden py-1"
        >
          {row2.map((item, idx) => renderCard(item, "r2", idx))}
        </Marquee>
      </div>


      {/* High-Res Spotlight Modal on Click */}
      {spotlightItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-8 bg-forest/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          onClick={closeSpotlight}
        >
          <div
            className="relative w-full max-w-3xl bg-[#faf8f5] rounded-3xl overflow-hidden shadow-2xl border border-paper/20 grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeSpotlight}
              aria-label="Zavřít"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-forest/80 text-paper hover:bg-forest flex items-center justify-center text-xs cursor-pointer shadow-md transition-colors"
            >
              ✕
            </button>

            {/* Left: High-res photo display */}
            <div className="md:col-span-6 relative aspect-[3/4] md:aspect-auto md:min-h-[460px] bg-bone overflow-hidden">
              <Image
                src={spotlightItem.src}
                alt={name(spotlightItem)}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-forest/85 text-paper px-3 py-1 rounded-full text-xs label tracking-wider">
                {t.cat[spotlightItem.category]} · {spotlightItem.service}
              </div>
            </div>

            {/* Right: Hairstyle breakdown & Booking */}
            <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between bg-paper">
              <div>
                <p className="label text-moss text-xs font-semibold tracking-wider">
                  {t.cat[spotlightItem.category]} · {spotlightItem.service}
                </p>
                <h3 className="font-serif italic text-2xl sm:text-3xl text-forest mt-1.5 leading-tight">
                  {name(spotlightItem)}
                </h3>

                <div className="mt-5 space-y-2.5 pt-3.5 border-t border-forest/10 text-xs text-ink-soft leading-relaxed">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">Doba v salonu:</span>
                    <span className="font-mono bg-bone px-2 py-0.5 rounded text-ink font-semibold">
                      {spotlightItem.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">Cena:</span>
                    <span className="font-serif text-lg font-bold text-forest">
                      {spotlightItem.from ? `${t.servicesFrom} ` : ""}{spotlightItem.price} Kč
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-ink-soft font-light text-[11px] leading-relaxed">
                      {lang === "cs"
                        ? "Při návštěvě provádíme úvodní diagnostiku vlasů a doporučíme optimální odstín, střih i domácí péči."
                        : "During your visit, we perform initial hair diagnostics and advise on the ideal tone, cut, and home care."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-6 pt-4 border-t border-forest/10">
                <button
                  onClick={() => {
                    bookLook(spotlightItem);
                    closeSpotlight();
                  }}
                  className="w-full cursor-pointer rounded-full bg-forest text-paper py-3.5 text-sm font-medium tracking-wide hover:bg-moss transition-all duration-300 shadow-md text-center block"
                >
                  {t.lookCta} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
