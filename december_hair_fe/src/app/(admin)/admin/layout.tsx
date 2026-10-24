import type { Metadata } from "next";
import AdminProviders from "@/admin/Providers";
import { fontVars } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: { default: "December Admin", template: "%s · December Admin" },
  robots: { index: false, follow: false },
};

// The back office has its own root layout: no smooth scrolling, intro or site chrome
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body className="bg-paper text-ink antialiased min-h-screen">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
