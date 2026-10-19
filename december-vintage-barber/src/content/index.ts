import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { localContent } from "./local";
import type { SiteContent } from "./types";

export const CONTENT_TAG = "content";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api/v1";

/**
 * Everything the page shows, from the CMS (GET /public/content). Cached under the `content`
 * tag, which the backend revalidates after every save; `hours` is the safety net if that call
 * is ever lost.
 *
 * If the API can't be reached (a build without it, an outage), the bundled content is served
 * instead, cached only for minutes and still under the tag: the site comes back to the CMS
 * content by itself shortly after the API does.
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  try {
    const res = await fetch(`${API_URL}/public/content`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const content = (await res.json()) as SiteContent;
    cacheLife("hours");
    return content;
  } catch (err) {
    console.warn(`[content] ${API_URL} unavailable (${err}); serving the bundled content`);
    cacheLife("minutes");
    return localContent();
  }
}
