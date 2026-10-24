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
    return withBundledTexts(content);
  } catch (err) {
    console.warn(`[content] ${API_URL} unavailable (${err}); serving the bundled content`);
    cacheLife("minutes");
    return localContent();
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** `cms` with whatever `bundled` has and it lacks; the paths of what was filled go to `missing` */
function fill(cms: unknown, bundled: unknown, path: string, missing: string[]): unknown {
  if (cms === undefined) {
    missing.push(path);
    return bundled;
  }
  if (isObject(cms) && isObject(bundled)) {
    const out = { ...cms };
    for (const [key, value] of Object.entries(bundled)) out[key] = fill(cms[key], value, `${path}.${key}`, missing);
    return out;
  }
  if (Array.isArray(cms) && Array.isArray(bundled)) {
    return bundled.map((value, i) => fill(cms[i], value, `${path}.${i}`, missing));
  }
  return cms;
}

/**
 * A text key the code gained (added to `T` in data.ts) is not in the CMS until the backend runs
 * `sync-texts`: show the bundled wording meanwhile instead of an empty spot.
 */
function withBundledTexts(content: SiteContent): SiteContent {
  const { texts } = localContent();
  const missing: string[] = [];
  const filled = {
    cs: fill(content.texts.cs, texts.cs, "cs", missing),
    en: fill(content.texts.en, texts.en, "en", missing),
  } as SiteContent["texts"];
  if (missing.length) {
    console.warn(`[content] ${missing.length} texts are not in the CMS yet, showing data.ts (run sync-texts in the backend): ${missing.slice(0, 10).join(", ")}`);
  }
  return { ...content, texts: filled };
}
