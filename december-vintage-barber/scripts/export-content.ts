// Dumps the bundled site content (SiteContent, the shape GET /api/v1/public/content serves) for the
// backend seed: npm run export:content [-- out.json]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { localContent } from "../src/content/local";

const out = resolve(process.argv[2] ?? "../backend/seed/content.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(localContent(), null, 2) + "\n");
console.log(`Wrote ${out}`);
