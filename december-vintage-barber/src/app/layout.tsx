import type { Metadata } from "next";
import { Bodoni_Moda, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

// Didone serif, matching the December wordmark; opsz keeps small sizes from going spindly
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  axes: ["opsz"],
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
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
    <html lang="cs" className={`${bodoni.variable} ${schibsted.variable}`}>
      <body className="bg-paper text-ink antialiased min-h-screen">{children}</body>
    </html>
  );
}
