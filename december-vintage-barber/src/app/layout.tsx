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

export const metadata: Metadata = {
  title: "December Hair — kadeřnictví Praha, Kladno, Mladá Boleslav",
  description:
    "Kadeřnictví pro ženy, muže i děti. Tři salony: OC Europark Praha, OC Central Kladno a OC Bondy Mladá Boleslav. Otevřeno každý den.",
  icons: {
    icon: "/images/logo-green.png",
  },
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
