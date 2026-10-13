import saved from "./glow.settings.json";

/** Everything the corner glow needs. Saved in glow.settings.json; edited live at /studio in development. */
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

type NumberKey = { [K in keyof GlowSettings]: GlowSettings[K] extends number ? K : never }[keyof GlowSettings];
type BooleanKey = { [K in keyof GlowSettings]: GlowSettings[K] extends boolean ? K : never }[keyof GlowSettings];

export type SliderSpec = { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string };

/** Same controls, ranges and order as the React Bits Background Studio for Grainient. */
export const SLIDERS: SliderSpec[] = [
  { key: "angle", label: "Angle", min: 0, max: 360, step: 1 },
  { key: "bands", label: "Bands", min: 1, max: 6, step: 1 },
  { key: "softness", label: "Softness", min: 0, max: 1, step: 0.01 },
  { key: "flow", label: "Flow", min: 0, max: 2, step: 0.01 },
  { key: "scale", label: "Scale", min: 0.25, max: 3, step: 0.01 },
  { key: "speed", label: "Speed", min: 0, max: 3, step: 0.01 },
  { key: "silk", label: "Silk", min: 0, max: 1, step: 0.01 },
  { key: "grainAmount", label: "Grain Amount", min: 0, max: 0.3, step: 0.01 },
  { key: "grainSize", label: "Grain Size", min: 0.5, max: 4, step: 0.01 },
  { key: "contrast", label: "Contrast", min: 0.5, max: 1.6, step: 0.01 },
  { key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.01 },
  { key: "variation", label: "Variation", min: 0, max: 20, step: 1 },
  { key: "stir", label: "Stir", min: 0, max: 2, step: 0.01 },
];

export const TOGGLES: { key: BooleanKey; label: string }[] = [
  { key: "grainAnimated", label: "Animated Grain" },
  { key: "interactive", label: "Interactive" },
  { key: "clickSwirl", label: "Click Swirl" },
  { key: "intro", label: "Intro" },
];

/** Not in React Bits: where the glow sits on the page. */
export const PLACEMENT: SliderSpec[] = [
  { key: "reach", label: "Reach", min: 10, max: 70, step: 1, unit: "% of short side" },
  { key: "maxReach", label: "Max reach", min: 100, max: 1000, step: 10, unit: "px" },
];

/** Grainient accepts up to 8 colours; two go to the background stops added in front by `glowPalette`. */
export const MAX_COLORS = 6;

/** React Bits' own Grainient default starts from this near-black. */
export const DEFAULT_BACKGROUND = "#120f17";

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

const HEX = /^#[0-9a-f]{6}$/i;

/** Checks an unknown value (the saved file, or a save request) and returns settings or a reason it isn't valid. */
export function parseSettings(input: unknown): GlowSettings | string {
  if (typeof input !== "object" || input === null) return "Settings must be an object.";
  const o = input as Record<string, unknown>;
  if (typeof o.background !== "string" || !HEX.test(o.background)) return "background must be a #rrggbb hex value.";
  if (!Array.isArray(o.colors) || o.colors.length < 1 || o.colors.length > MAX_COLORS)
    return `colors must have 1 to ${MAX_COLORS} entries.`;
  if (!o.colors.every((c) => typeof c === "string" && HEX.test(c))) return "Every colour must be a #rrggbb hex value.";
  if (o.type !== "linear" && o.type !== "radial") return 'type must be "linear" or "radial".';
  if (o.attach !== "fixed" && o.attach !== "page") return 'attach must be "fixed" or "page".';
  for (const s of [...SLIDERS, ...PLACEMENT]) {
    const v = o[s.key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < s.min || v > s.max)
      return `${s.label} must be a number from ${s.min} to ${s.max}.`;
  }
  for (const t of TOGGLES) if (typeof o[t.key] !== "boolean") return `${t.label} must be true or false.`;
  const out = {
    background: o.background,
    colors: o.colors as string[],
    type: o.type,
    attach: o.attach,
  } as GlowSettings;
  for (const s of [...SLIDERS, ...PLACEMENT]) (out[s.key] as number) = o[s.key] as number;
  for (const t of TOGGLES) (out[t.key] as boolean) = o[t.key] as boolean;
  return out;
}

const parsed = parseSettings(saved);
if (typeof parsed === "string") throw new Error(`src/components/glow.settings.json: ${parsed}`);

/** The settings the site ships with. */
export const glowSettings: GlowSettings = parsed;
