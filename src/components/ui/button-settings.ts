import saved from "./buttons.settings.json";

/**
 * The site's buttons: magnetic (they lean toward the cursor) in a chosen look, plus how the stateful buttons show
 * their work: download progress, and sending a message. Chosen in the button studio (/studio/buttons), saved to
 * buttons.settings.json.
 */
export const BUTTON_OPTIONS = {
  look: ["solid", "soft", "outline"],
  secondary: ["outline", "soft", "ghost"],
  accent: ["ink", "primary"],
  /** The primary colour's palette (light and dark shades in globals.css). */
  primary: ["teal", "ocean", "lagoon", "jade", "cobalt"],
  /** Main and secondary buttons fill with the primary colour on hover, an oval rising from below. */
  fill: ["rise", "none"],
  shape: ["pill", "rounded", "square"],
  size: ["sm", "md", "lg"],
  icons: ["end", "start", "none"],
  spring: ["elastic", "soft", "snappy", "bouncy"],
  progress: ["outline", "fill", "bar", "ring"],
  sending: ["plane", "dots", "spinner"],
  link: ["grow", "slide", "arrow"],
} as const;

/** Magnetic pull: [min, max, step]. */
export const BUTTON_RANGES = {
  /** How far the button follows the cursor, in px, with the cursor at its edge. */
  strength: [0, 30, 0.5],
  /** How much further the label moves than the button (0 = with the button). */
  follow: [0, 1.5, 0.1],
  /** Seconds the fill takes to rise over the button (the text turns in half of it). */
  fillTime: [0.2, 1.2, 0.05],
  /** Seconds the button takes to catch up with the cursor: higher trails more. */
  followTime: [0.1, 2.5, 0.1],
  /** Seconds it takes to spring back when the cursor leaves. */
  releaseTime: [0.2, 2.5, 0.05],
} as const;

/** Each letting-go curve's natural length; the studio sets releaseTime to it when the curve changes. */
export const SPRING_TIMES = { elastic: 1.5, soft: 0.8, snappy: 0.45, bouncy: 1.1 } as const;

type Options = typeof BUTTON_OPTIONS;
type Ranges = typeof BUTTON_RANGES;
export type ButtonSettings = { [K in keyof Options]: Options[K][number] } & { [K in keyof Ranges]: number } & {
  /** A soft shadow in the button's colour while the cursor is on it. */
  shadow: boolean;
  /** Dip slightly when pressed. */
  press: boolean;
  /** Show the percentage while downloading. */
  percent: boolean;
};

export const BUTTON_DEFAULTS: ButtonSettings = {
  look: "solid",
  secondary: "outline",
  accent: "ink",
  primary: "teal",
  fill: "rise",
  shape: "pill",
  size: "md",
  icons: "end",
  spring: "elastic",
  progress: "outline",
  sending: "plane",
  link: "grow",
  strength: 12.5,
  follow: 0.6,
  fillTime: 0.6,
  followTime: 1.5,
  releaseTime: 1.5,
  shadow: true,
  press: true,
  percent: true,
};

export function parseButtonSettings(input: unknown): ButtonSettings | string {
  if (!input || typeof input !== "object") return "Expected an object.";
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, choices] of Object.entries(BUTTON_OPTIONS)) {
    if (!(choices as readonly unknown[]).includes(raw[key])) return `Invalid button ${key}.`;
    out[key] = raw[key];
  }
  for (const [key, [min, max]] of Object.entries(BUTTON_RANGES)) {
    const v = raw[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) return `Invalid button ${key}.`;
    out[key] = v;
  }
  for (const key of ["shadow", "press", "percent"]) {
    if (typeof raw[key] !== "boolean") return `Invalid button ${key}.`;
    out[key] = raw[key];
  }
  return out as ButtonSettings;
}

/** The saved settings; anything the file predates (or no longer has) falls back to the defaults. */
const file = saved as Partial<Record<string, unknown>>;
export const buttonSettings: ButtonSettings = Object.fromEntries(
  Object.entries(BUTTON_DEFAULTS).map(([k, v]) => [k, typeof file[k] === typeof v ? file[k] : v]),
) as ButtonSettings;
