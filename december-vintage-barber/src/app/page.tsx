"use client";

import { useCallback, useEffect, useState } from "react";
import { T, type Category, type Lang } from "./data";
import { ScrollTrigger } from "@/lib/gsap";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PriceList from "@/components/PriceList";
import Reels from "@/components/Reels";
import Lookbook from "@/components/Lookbook";
import Voucher from "@/components/Voucher";
import Branches from "@/components/Branches";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";

export default function DecemberPage() {
  const [lang, setLang] = useState<Lang>("cs");
  const t = T[lang];
  const [ready, setReady] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [branch, setBranch] = useState("europark");
  const [category, setCategory] = useState<Category>("women");
  const [note, setNote] = useState("");

  const book = useCallback((opts?: { branch?: string; category?: Category; note?: string }) => {
    setNote(opts?.note ?? "");
    if (opts?.branch) setBranch(opts.branch);
    if (opts?.category) setCategory(opts.category);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);
  const onLoaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Fonts change line lengths; re-measure every pinned scene once they land
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <div>
      <SmoothScroll />
      <Loader line={t.introLine} onDone={onLoaded} />
      <Header t={t} lang={lang} setLang={setLang} onBook={() => book()} />
      <main>
        <Hero t={t} ready={ready} />
        <About t={t} onBook={(c, note) => book({ category: c, note })} />
        <Services t={t} onBook={(c) => book({ category: c })} />
        <PriceList t={t} lang={lang} onBook={(c, items) => book({ category: c, note: items })} />
        <Reels t={t} lang={lang} onBook={(b) => book({ branch: b })} />
        <Lookbook t={t} lang={lang} onBook={(c, look) => book({ category: c, note: look })} />
        <Voucher t={t} lang={lang} onBook={(note) => book({ note })} />
        <Branches t={t} onBook={(b) => book(b ? { branch: b } : undefined)} />
      </main>
      <Footer t={t} />
      <BookingModal
        t={t}
        open={bookingOpen}
        onClose={closeBooking}
        branch={branch}
        setBranch={setBranch}
        category={category}
        setCategory={setCategory}
        note={note}
        setNote={setNote}
      />
    </div>
  );
}
