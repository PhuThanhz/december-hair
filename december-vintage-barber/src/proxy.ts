import { NextResponse, type NextRequest } from "next/server";

// The backend's httpOnly session cookie (backend/app/core/security.py)
const SESSION_COOKIE = "dh_session";

/**
 * Czech is the site's own language and lives at /, English at /en; the page itself is
 * app/(site)/[lang]. In order:
 *   /admin…  only a sign-in check (the API does the real one), never rewritten
 *   /en…     as is
 *   /cs…     301 to the address without the prefix, so Czech has one URL
 *   the rest rewritten to /cs…
 * No redirect by Accept-Language: search engines must see each language at its own URL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login" && !request.cookies.has(SESSION_COOKIE)) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      // Back to where they were going once signed in
      login.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  if (pathname === "/cs" || pathname.startsWith("/cs/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 301);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/cs${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Not the API, media, Next's own files, metadata routes or anything with a file extension
  matcher: ["/((?!api/|media/|_next/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.[\\w]+$).*)"],
};
