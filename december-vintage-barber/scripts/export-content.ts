// Dumps the bundled site content (SiteContent, the shape GET /api/v1/public/content serves) for the
// backend's seed and sync-texts: npm run export:content [-- out.json]
// By default it writes seed/content.json of the backend repo, cloned next to this one or inside it.
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { localContent } from "../src/content/local";

const BACKEND_SEEDS = ["../../december_hair_be/seed", "../december_hair_be/seed"];
const seedDir = BACKEND_SEEDS.map((d) => resolve(d)).find((d) => existsSync(d));
if (!process.argv[2] && !seedDir) {
  console.error("december_hair_be not found next to or inside this repo: clone it there, or pass a path (npm run export:content -- out.json)");
  process.exit(1);
}
const out = resolve(process.argv[2] ?? `${seedDir}/content.json`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(localContent(), null, 2) + "\n");
console.log(`Wrote ${out}`);
