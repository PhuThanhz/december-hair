import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

// The tags the backend may expire (backend/app/services/revalidate.py)
const TAGS = new Set(["content", "seo"]);

const sameSecret = (given: string | null, expected: string) =>
  !!given && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));

/**
 * Called by the backend over the internal network after the CMS saves something:
 * POST { tags: ["content"] } with header x-revalidate-secret. Nginx keeps this path private.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !sameSecret(request.headers.get("x-revalidate-secret"), secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && TAGS.has(t)) : [];
  if (!tags.length) return Response.json({ ok: false, error: "no known tags" }, { status: 400 });
  // Expire now, so the next visitor (and the admin reloading the page) already sees the edit
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, revalidated: tags });
}
