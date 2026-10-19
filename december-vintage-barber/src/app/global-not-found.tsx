import type { Metadata } from "next";
import Link from "next/link";
import { fontVars } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — December Hair",
  robots: { index: false },
};

// Any address that matches no page (there is no single root layout to build a 404 from)
export default function GlobalNotFound() {
  return (
    <html lang="cs" className={fontVars}>
      <body className="bg-paper text-ink antialiased min-h-screen grid place-items-center px-6">
        <main className="max-w-md text-center">
          <p className="label text-ink-soft">404</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.95]">
            Stránka nenalezena
          </h1>
          <p className="mt-4 text-ink-soft">
            Tahle stránka neexistuje. <span className="block">This page does not exist.</span>
          </p>
          <div className="mt-8 flex justify-center gap-3 text-sm">
            <Link href="/" className="rounded-full bg-forest text-paper px-6 py-3 hover:bg-moss transition-colors">
              December Hair
            </Link>
            <Link href="/en" className="rounded-full border border-ink/20 px-6 py-3 hover:border-ink transition-colors">
              English
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
