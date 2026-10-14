import saved from "./home.settings.json";

/** The hero's look (the "inline" hero), chosen by the owner and kept in home.settings.json. */
export const HOME_OPTIONS = {
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

export const homeSettings: HomeSettings = { ...HOME_DEFAULTS, ...(saved as Partial<HomeSettings>) };
