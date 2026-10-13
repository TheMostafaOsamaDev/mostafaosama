import saved from "./glow.settings.json";

/** Everything the corner glow needs. Saved in glow.settings.json; edited live at /studio in development. */
export type GlowSettings = {
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

/** Grainient accepts up to 8 colours. */
export const MAX_COLORS = 8;

const HEX = /^#[0-9a-f]{6}$/i;

/** Checks an unknown value (the saved file, or a save request) and returns settings or a reason it isn't valid. */
export function parseSettings(input: unknown): GlowSettings | string {
  if (typeof input !== "object" || input === null) return "Settings must be an object.";
  const o = input as Record<string, unknown>;
  if (!Array.isArray(o.colors) || o.colors.length < 2 || o.colors.length > MAX_COLORS)
    return `colors must have 2 to ${MAX_COLORS} entries.`;
  if (!o.colors.every((c) => typeof c === "string" && HEX.test(c))) return "Every colour must be a #rrggbb hex value.";
  if (o.type !== "linear" && o.type !== "radial") return 'type must be "linear" or "radial".';
  if (o.attach !== "fixed" && o.attach !== "page") return 'attach must be "fixed" or "page".';
  for (const s of [...SLIDERS, ...PLACEMENT]) {
    const v = o[s.key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < s.min || v > s.max)
      return `${s.label} must be a number from ${s.min} to ${s.max}.`;
  }
  for (const t of TOGGLES) if (typeof o[t.key] !== "boolean") return `${t.label} must be true or false.`;
  const out = { colors: o.colors as string[], type: o.type, attach: o.attach } as GlowSettings;
  for (const s of [...SLIDERS, ...PLACEMENT]) (out[s.key] as number) = o[s.key] as number;
  for (const t of TOGGLES) (out[t.key] as boolean) = o[t.key] as boolean;
  return out;
}

const parsed = parseSettings(saved);
if (typeof parsed === "string") throw new Error(`src/components/glow.settings.json: ${parsed}`);

/** The settings the site ships with. */
export const glowSettings: GlowSettings = parsed;
