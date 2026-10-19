import "server-only";
import { localContent } from "./local";
import type { SiteContent } from "./types";

/** Everything the page shows. Server-only: the page passes it down to the client tree. */
export async function getContent(): Promise<SiteContent> {
  return localContent();
}
