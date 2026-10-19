import { Suspense } from "react";
import AdminShell from "@/admin/AdminShell";

// The shell reads the URL (usePathname), which a dynamic route such as /admin/branches/[id]
// only knows at request time: inside Suspense it streams in instead of blocking prerendering
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
