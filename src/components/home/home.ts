import saved from "./home.settings.json";

/** The home page's look: chosen in the home studio (/studio/home) and saved to home.settings.json. */
export const HOME_OPTIONS = {
  variant: ["split", "glow", "inline", "card", "centered", "editorial"],
  tone: ["natural", "cool", "duotone", "mono"],
  shape: ["rounded", "arch", "circle", "square"],
  edge: ["hard", "fade"],
  textIn: ["reveal", "rise", "blur", "words", "none"],
  photoIn: ["clip", "fade", "scale", "focus", "none"],
  pace: ["calm", "brisk"],
  navReveal: ["hero", "start"],
} as const;

type Options = typeof HOME_OPTIONS;
export type HomeSettings = { [K in keyof Options]: Options[K][number] } & {
  badge: boolean;
  ctas: boolean;
  signature: boolean;
};

export const HOME_DEFAULTS: HomeSettings = {
  variant: "split",
  tone: "cool",
  shape: "arch",
  edge: "hard",
  textIn: "reveal",
  photoIn: "clip",
  pace: "calm",
  navReveal: "hero",
  badge: true,
  ctas: true,
  signature: true,
};

/** Validates the studio's save request. Returns the clean settings or a reason. */
export function parseHomeSettings(input: unknown): HomeSettings | string {
  if (!input || typeof input !== "object") return "Expected an object.";
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, choices] of Object.entries(HOME_OPTIONS)) {
    if (!(choices as readonly unknown[]).includes(raw[key])) return `Invalid ${key}.`;
    out[key] = raw[key];
  }
  for (const key of ["badge", "ctas", "signature"]) {
    if (typeof raw[key] !== "boolean") return `Invalid ${key}.`;
    out[key] = raw[key];
  }
  return out as HomeSettings;
}

export const homeSettings: HomeSettings = { ...HOME_DEFAULTS, ...(saved as Partial<HomeSettings>) };
