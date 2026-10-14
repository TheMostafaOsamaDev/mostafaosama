import { Alexandria } from "next/font/google";

// Arabic letters only; Latin words in Arabic text fall through to the Latin face (no fallback font in between).
// Not preloaded: Next preloads fonts for every page, so preloading this one made English pages download it too.
const font = Alexandria({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});
export const fontVariables = font.variable;
