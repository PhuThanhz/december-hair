import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, type Lang } from "@/content/types";
import { fontVars } from "../../fonts";
import "../../globals.css";

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

// /cs and /en are prerendered; the proxy serves Czech at / and English at /en
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  // Outside any Suspense boundary, so an unknown language is a real 404
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  return (
    <html lang={lang} className={fontVars}>
      <body className="bg-paper text-ink antialiased min-h-screen">{children}</body>
    </html>
  );
}
