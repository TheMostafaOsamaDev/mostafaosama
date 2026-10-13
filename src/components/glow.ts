import saved from "./glow.settings.json";

/** Everything the corner glow needs. The values live in glow.settings.json (tuned and approved by the owner). */
export type GlowSettings = {
  /** Dark-mode page colour. Also the colour the glow fades into (light mode fades into white instead). */
  background: string;
  /** The glow's own colours, from its outer edge to the corner. The background is put in front automatically. */
  colors: string[];
  type: "linear" | "radial";
  angle: number;
  bands: number;
  softness: number;
  flow: number;
  scale: number;
  speed: number;
  silk: number;
  grainAmount: number;
  grainSize: number;
  contrast: number;
  saturation: number;
  variation: number;
  stir: number;
  grainAnimated: boolean;
  interactive: boolean;
  clickSwirl: boolean;
  intro: boolean;
  /** How far the glow reaches from the corner, as a % of the screen's shorter side (vmin). */
  reach: number;
  /** Upper bound for that reach, in px, for very large screens. */
  maxReach: number;
  /** "fixed" stays in the corner while the page scrolls; "page" sits at the top of the page and scrolls away. */
  attach: "fixed" | "page";
};

/**
 * The palette Grainient actually gets: the background twice, then the glow colours. A radial Grainient is still
 * mid-ramp at its canvas edge, so the repeated background stop makes the colour reach the page before the edge
 * and the glow dissolves into it instead of ending in a ring. In light mode Grainient's `lightMode` turns those
 * background stops into white.
 */
export function glowPalette(s: Pick<GlowSettings, "background" | "colors" | "contrast" | "saturation">): string[] {
  const base = undoContrast(s.background, s.contrast, s.saturation);
  return [base, base, ...s.colors];
}

// Grainient applies contrast and saturation to every colour in OKLab inside its shader:
//   L' = (L - 0.55) * contrast + 0.55,   a' = a * saturation,   b' = b * saturation
// That moves the background stops too, so with contrast ≠ 1 the glow would fade into a slightly different colour
// than the page and leave a faint ring. Feeding it the inverse makes the shader land exactly on the page colour.
// The conversions below are the same OKLab maths Grainient uses (its `toLab` and `labToRgb`).
function undoContrast(hex: string, contrast: number, saturation: number): string {
  if (contrast === 1 && saturation === 1) return hex;
  const [L, a, b] = toLab(hex);
  const target: [number, number, number] = [
    (L - 0.55) / contrast + 0.55,
    saturation ? a / saturation : a,
    saturation ? b / saturation : b,
  ];
  return fromLab(target);
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

function toLab(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromLab([L, a, b]: [number, number, number]): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** The settings the site ships with. JSON widens the string unions, hence the assertion. */
export const glowSettings = saved as GlowSettings;
