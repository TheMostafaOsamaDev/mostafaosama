import fs from "node:fs";
import path from "node:path";
import { site } from "@/content/site";

const FILE = "portrait-mask.png";
const exists = fs.existsSync(path.join(process.cwd(), "public", FILE));

/**
 * The dithered portrait, drawn as a mask filled with the ink token so it matches both themes.
 * Renders nothing until `scripts/portrait/build.mjs` has produced public/portrait-mask.png.
 */
export function Portrait() {
  if (!exists) return null;
  return (
    <span
      role="img"
      aria-label={`Portrait of ${site.name}`}
      // Dark theme uses the inverted mask; with light ink on dark paper the other one is a negative.
      className="block size-14 shrink-0 bg-ink [mask-image:url(/portrait-mask.png)] [mask-size:100%] [mask-repeat:no-repeat] sm:size-16 dark:[mask-image:url(/portrait-mask-dark.png)]"
    />
  );
}
