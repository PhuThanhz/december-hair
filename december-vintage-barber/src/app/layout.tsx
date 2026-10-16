import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Sharp, high-contrast display serif with a restrained italic; full Czech accents (ř, č, ě, ů).
// Self-hosted Noto Serif Display (google/fonts, OFL): width pinned at 100, the weight axis kept, cut
// down to Latin-1 + Latin Extended-A, so Czech needs ~75 KB per style instead of Google's ~250 KB.
//   fonttools varLib.instancer "NotoSerifDisplay[wdth,wght].ttf" wdth=100 -o tmp.ttf
//   pyftsubset tmp.ttf --unicodes="U+0000-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,
//     U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD"
//     --layout-features='*' --flavor=woff2
const notoSerif = localFont({
  variable: "--font-serif-face",
  src: [
    { path: "./fonts/NotoSerifDisplay-LatinCz.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/NotoSerifDisplay-Italic-LatinCz.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
  // Not preloaded: on a slow connection the preloads crowded out the stylesheet and the hero poster.
  // The first visit's serif swaps in behind the intro curtain; the metric-matched fallback keeps it still
  preload: false,
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const title = "December Hair — kadeřnictví Praha, Kladno, Mladá Boleslav";
const description =
  "Kadeřnictví pro ženy, muže i děti. Tři salony: OC Europark Praha, OC Central Kladno a OC Bondy Mladá Boleslav. Otevřeno každý den.";

export const metadata: Metadata = {
  // Absolute URLs for the share image; set NEXT_PUBLIC_SITE_URL once the salon has its own domain
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://december-hair.vercel.app"),
  title,
  description,
  // Link previews (Facebook, Zalo, Messenger, WhatsApp, iMessage); the image is app/opengraph-image.jpg
  openGraph: {
    type: "website",
    siteName: "December Hair",
    locale: "cs_CZ",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${notoSerif.variable} ${schibsted.variable}`}>
      <body className="bg-paper text-ink antialiased min-h-screen">{children}</body>
    </html>
  );
}
