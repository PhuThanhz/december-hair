// Dumps the bundled site content (SiteContent, the shape GET /api/v1/public/content serves) for the
// backend's seed and sync-texts: npm run export:content [-- out.json]
// By default it writes seed/content.json of the backend repo, cloned next to this one.
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { localContent } from "../src/content/local";

const DEFAULT_OUT = "../../december_hair_be/seed/content.json";
const out = resolve(process.argv[2] ?? DEFAULT_OUT);
if (!process.argv[2] && !existsSync(dirname(out))) {
  console.error(`${dirname(out)} not found: clone december_hair_be next to this repo, or pass a path (npm run export:content -- out.json)`);
  process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(localContent(), null, 2) + "\n");
console.log(`Wrote ${out}`);
