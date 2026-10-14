import saved from "./nav.settings.json";

/**
 * Everything the floating navigation can hold. Pages navigate; links leave the site; tools act in place (search
 * opens a palette, theme switches the colour scheme, copy puts the email on the clipboard, top scrolls up,
 * settings and menu open panels).
 */
export const NAV_ITEMS = [
  { id: "home", label: "Home", kind: "page", href: "" },
  { id: "work", label: "Work", kind: "page", href: "/work" },
  { id: "experience", label: "Experience", kind: "page", href: "/experience" },
  { id: "lab", label: "Lab", kind: "page", href: "/lab" },
  { id: "writing", label: "Writing", kind: "page", href: "/writing" },
  { id: "about", label: "About", kind: "page", href: "/about" },
  { id: "contact", label: "Contact", kind: "page", href: "/contact" },
  { id: "github", label: "GitHub", kind: "link", href: "https://github.com/TheMostafaOsamaDev" },
  { id: "linkedin", label: "LinkedIn", kind: "link", href: "https://www.linkedin.com/in/mostafa-osama-a5b042239" },
  { id: "email", label: "Email", kind: "link", href: "mailto:mostafa.osama.dev@gmail.com" },
  { id: "cv", label: "CV", kind: "link", href: "/mostafa-osama-cv.pdf" },
  { id: "search", label: "Search", kind: "tool", href: "" },
  { id: "theme", label: "Theme", kind: "tool", href: "" },
  { id: "copy", label: "Copy email", kind: "tool", href: "" },
  { id: "top", label: "Back to top", kind: "tool", href: "" },
  { id: "settings", label: "Settings", kind: "tool", href: "" },
  { id: "menu", label: "Menu", kind: "tool", href: "" },
  { id: "lang", label: "Language", kind: "tool", href: "" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];
/** An item; the label is widened so the nav can rename one (the menu shows as "More" when items overflow). */
export type NavItem = Omit<(typeof NAV_ITEMS)[number], "label"> & { label: string };
export const EMAIL = "mostafa.osama.dev@gmail.com";

/** What each item does, shown in the studio's item list. */
export const ITEM_NOTES: Partial<Record<NavItemId, string>> = {
  search: "Command palette: pages, links and actions. ⌘K or / opens it.",
  theme: "Switches light and dark, with its own transition.",
  copy: "Copies the email address and confirms with a check.",
  top: "Appears once you scroll down a screen.",
  settings: "Panel with theme and motion preferences.",
  menu: "Panel with every page and link, including the hidden ones.",
  lang: "Switches between English and Arabic (right-to-left).",
};

/** The choices for every per-device option, in display order. */
export const NAV_OPTIONS = {
  library: ["lucide", "phosphor", "tabler", "heroicons", "remix", "iconoir", "hugeicons"],
  phosphorWeight: ["thin", "light", "regular", "bold", "duotone"],
  activeIcon: ["same", "filled"],
  position: ["bottom", "top", "left", "right"],
  surface: ["solid", "glass", "outline", "inverted"],
  shadow: ["none", "soft", "raised", "floating"],
  shape: ["pill", "rounded", "soft"],
  labels: ["tooltip", "active", "always", "text", "none"],
  entrance: ["none", "rise", "grow", "drop", "stagger"],
  indicator: ["none", "pill", "dot", "line"],
  indicatorMotion: ["slide", "stretch", "fade"],
  hover: ["none", "bubble", "lift", "magnify"],
  iconHover: ["none", "bounce", "wiggle", "tilt"],
  scroll: ["static", "hide", "shrink", "reveal", "bare"],
  panel: ["morph", "popover", "sheet"],
  panelContent: ["stagger", "fade", "none"],
  ease: ["smooth", "snappy", "expo", "back", "elastic"],
  page: ["none", "fade", "rise", "blur", "scale", "slide", "wipe", "reveal"],
  pageEase: ["out", "in-out", "emphasized", "linear"],
  pageMode: ["overlap", "sequential"],
} as const;

/** Per-device numbers: [min, max, step]. */
export const NAV_RANGES = {
  stroke: [1, 2.5, 0.25],
  iconSize: [16, 26, 1],
  itemSize: [32, 52, 2],
  padding: [2, 12, 1],
  gap: [0, 12, 1],
  offset: [12, 48, 2],
  glassBlur: [0, 32, 1],
  glassTint: [20, 95, 5],
  duration: [0.15, 1.2, 0.05],
  pageDuration: [150, 900, 25],
  pageDistance: [0, 80, 4],
} as const;

/** Settings shared by both devices. */
export const SHARED_OPTIONS = { themeSwitch: ["instant", "fade", "circle"] } as const;
export const BREAKPOINT_RANGE = [480, 1200, 16] as const;

type Options = typeof NAV_OPTIONS;
type Ranges = typeof NAV_RANGES;

/** One device's nav. */
export type NavProfile = { [K in keyof Options]: Options[K][number] } & { [K in keyof Ranges]: number } & {
  /** Shown items, in order. */
  items: NavItemId[];
  separators: boolean;
  press: boolean;
};

export type Device = "desktop" | "mobile";

export type NavConfig = {
  /** Widths from this many px up use the desktop nav. */
  breakpoint: number;
  themeSwitch: (typeof SHARED_OPTIONS.themeSwitch)[number];
  desktop: NavProfile;
  mobile: NavProfile;
};

const BASE_PROFILE: NavProfile = {
  library: "lucide",
  stroke: 1.75,
  phosphorWeight: "regular",
  activeIcon: "same",
  iconSize: 20,
  items: ["home", "work", "lab", "about", "github", "linkedin", "search", "theme", "menu"],
  separators: true,
  position: "bottom",
  surface: "solid",
  shadow: "raised",
  shape: "pill",
  itemSize: 40,
  padding: 6,
  gap: 2,
  offset: 24,
  glassBlur: 16,
  glassTint: 60,
  labels: "tooltip",
  entrance: "rise",
  indicator: "pill",
  indicatorMotion: "slide",
  hover: "bubble",
  iconHover: "none",
  press: true,
  scroll: "static",
  panel: "morph",
  panelContent: "stagger",
  ease: "smooth",
  duration: 0.45,
  page: "rise",
  pageDuration: 400,
  pageDistance: 16,
  pageEase: "out",
  pageMode: "sequential",
};

export const NAV_DEFAULTS: NavConfig = {
  breakpoint: 768,
  themeSwitch: "circle",
  desktop: BASE_PROFILE,
  mobile: {
    ...BASE_PROFILE,
    items: ["home", "work", "lab", "about", "menu"],
    itemSize: 44,
    gap: 4,
    offset: 16,
    labels: "none",
    hover: "none",
    scroll: "hide",
    panel: "sheet",
    page: "slide",
    pageDuration: 350,
    pageMode: "overlap",
  },
};

/** Starting points. A preset replaces the device being edited; everything stays adjustable afterwards. */
export const NAV_PRESETS: Record<string, { note: string; best: Device; profile: Partial<NavProfile> }> = {
  Quiet: { note: "Solid pill, sliding highlight, content rises in.", best: "desktop", profile: {} },
  Reference: {
    note: "Closest to the reference: icons only, raised, no highlight.",
    best: "desktop",
    profile: {
      library: "tabler",
      indicator: "none",
      hover: "lift",
      separators: false,
      itemSize: 44,
      gap: 4,
      page: "fade",
      pageDuration: 300,
    },
  },
  "Text bar": {
    note: "Top bar of page names over glass; icons for the rest.",
    best: "desktop",
    profile: {
      position: "top",
      surface: "glass",
      shadow: "soft",
      labels: "text",
      indicator: "line",
      indicatorMotion: "stretch",
      hover: "bubble",
      scroll: "shrink",
      panel: "popover",
      page: "fade",
      pageDuration: 300,
    },
  },
  "Side rail": {
    note: "Vertical rail on the left, tooltips to the side.",
    best: "desktop",
    profile: {
      position: "left",
      shape: "rounded",
      indicator: "pill",
      indicatorMotion: "stretch",
      hover: "lift",
      panel: "popover",
      items: ["home", "work", "experience", "lab", "about", "github", "linkedin", "search", "theme", "settings"],
      page: "slide",
    },
  },
  Dock: {
    note: "Frosted glass; icons magnify under the pointer.",
    best: "desktop",
    profile: {
      library: "phosphor",
      activeIcon: "filled",
      surface: "glass",
      shadow: "floating",
      shape: "rounded",
      indicator: "dot",
      indicatorMotion: "stretch",
      hover: "magnify",
      entrance: "drop",
      ease: "back",
      duration: 0.55,
      scroll: "hide",
      page: "blur",
      pageDuration: 450,
      pageMode: "overlap",
    },
  },
  Ink: {
    note: "Inverted pill; the current page names itself; pages reveal from the icon.",
    best: "desktop",
    profile: {
      library: "hugeicons",
      stroke: 1.5,
      surface: "inverted",
      shadow: "floating",
      labels: "active",
      indicatorMotion: "stretch",
      hover: "none",
      iconHover: "tilt",
      entrance: "grow",
      ease: "expo",
      duration: 0.6,
      panel: "popover",
      page: "reveal",
      pageDuration: 600,
      pageEase: "emphasized",
      pageMode: "overlap",
    },
  },
  "Thumb bar": {
    note: "Big targets, hides on scroll, menu as a bottom sheet.",
    best: "mobile",
    profile: NAV_DEFAULTS.mobile,
  },
  "Mobile dock": {
    note: "Glass, filled current icon, pages slide sideways.",
    best: "mobile",
    profile: {
      ...NAV_DEFAULTS.mobile,
      library: "phosphor",
      activeIcon: "filled",
      surface: "glass",
      shadow: "floating",
      shape: "rounded",
      indicator: "dot",
      items: ["home", "work", "lab", "about", "theme", "menu"],
      entrance: "drop",
      ease: "back",
    },
  },
};

export const presetProfile = (name: string): NavProfile => ({ ...BASE_PROFILE, ...NAV_PRESETS[name].profile });

const PAGE_EASES: Record<NavProfile["pageEase"], string> = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
};

/**
 * CSS variables for the page transition (read by the ::view-transition rules). The old page leaves faster than
 * the new one arrives (60%), so it doesn't compete with it. Wipe and reveal draw the new page over the old one,
 * which stays put underneath until they finish. Reduced motion keeps only a short cross-fade.
 */
export function pageTransitionVars(s: NavProfile, reduced: boolean): Record<string, string> {
  const variant = reduced && s.page !== "none" ? "fade" : s.page;
  const inDur = reduced ? 150 : s.pageDuration;
  const covers = variant === "wipe" || variant === "reveal";
  const outDur = covers ? inDur : Math.round(inDur * 0.6);
  const names = (inName: string, outName: string, fwd = [inName, outName], back = [inName, outName]) => ({
    "--pt-in": inName,
    "--pt-out": outName,
    "--pt-in-fwd": fwd[0],
    "--pt-out-fwd": fwd[1],
    "--pt-in-back": back[0],
    "--pt-out-back": back[1],
  });
  const byVariant = {
    none: names("none", "none"),
    fade: names("pt-fade-in", "pt-fade-out"),
    rise: names("pt-rise-in", "pt-rise-out"),
    blur: names("pt-blur-in", "pt-blur-out"),
    scale: names("pt-scale-in", "pt-scale-out"),
    slide: names(
      "pt-fade-in",
      "pt-fade-out",
      ["pt-slide-in-fwd", "pt-slide-out-fwd"],
      ["pt-slide-in-back", "pt-slide-out-back"],
    ),
    wipe: names("pt-fade-in", "pt-hold", ["pt-wipe-in-fwd", "pt-hold"], ["pt-wipe-in-back", "pt-hold"]),
    reveal: names("pt-reveal-in", "pt-hold"),
  }[variant];
  return {
    ...byVariant,
    "--pt-in-dur": `${inDur}ms`,
    "--pt-out-dur": `${outDur}ms`,
    "--pt-delay": s.pageMode === "sequential" && !covers ? `${outDur}ms` : "0ms",
    "--pt-ease": PAGE_EASES[s.pageEase],
    "--pt-out-ease": s.pageEase === "linear" ? "linear" : "cubic-bezier(0.4, 0, 1, 1)",
    "--pt-dist": `${s.pageDistance}px`,
    "--pt-blur": `${Math.max(2, s.pageDistance / 2)}px`,
    "--pt-scale-in": String(1 + s.pageDistance / 500),
    "--pt-scale-out": String(1 - s.pageDistance / 800),
    "--pt-bg": covers ? "var(--paper)" : "transparent",
  };
}

function parseProfile(input: unknown, device: Device): NavProfile | string {
  if (!input || typeof input !== "object") return `Missing ${device} settings.`;
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, choices] of Object.entries(NAV_OPTIONS)) {
    if (!(choices as readonly unknown[]).includes(raw[key])) return `Invalid ${device} ${key}.`;
    out[key] = raw[key];
  }
  for (const [key, [min, max]] of Object.entries(NAV_RANGES)) {
    const v = raw[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) return `Invalid ${device} ${key}.`;
    out[key] = v;
  }
  for (const key of ["separators", "press"]) {
    if (typeof raw[key] !== "boolean") return `Invalid ${device} ${key}.`;
    out[key] = raw[key];
  }
  const ids = NAV_ITEMS.map((i) => i.id as string);
  if (!Array.isArray(raw.items) || raw.items.some((i) => !ids.includes(i))) return `Invalid ${device} items.`;
  out.items = [...new Set(raw.items)];
  return out as NavProfile;
}

/** Validates the studio's save request. Returns the clean config or a reason. */
export function parseNavConfig(input: unknown): NavConfig | string {
  if (!input || typeof input !== "object") return "Expected an object.";
  const raw = input as Record<string, unknown>;
  const [min, max] = BREAKPOINT_RANGE;
  const bp = raw.breakpoint;
  if (typeof bp !== "number" || bp < min || bp > max) return "Invalid breakpoint.";
  if (!(SHARED_OPTIONS.themeSwitch as readonly unknown[]).includes(raw.themeSwitch)) return "Invalid themeSwitch.";
  const desktop = parseProfile(raw.desktop, "desktop");
  if (typeof desktop === "string") return desktop;
  const mobile = parseProfile(raw.mobile, "mobile");
  if (typeof mobile === "string") return mobile;
  return { breakpoint: bp, themeSwitch: raw.themeSwitch as NavConfig["themeSwitch"], desktop, mobile };
}

/** The config the site ships with; fills in anything the saved file predates. */
const file = saved as Partial<NavConfig>;
export const navConfig: NavConfig = {
  ...NAV_DEFAULTS,
  ...file,
  desktop: { ...NAV_DEFAULTS.desktop, ...file.desktop },
  mobile: { ...NAV_DEFAULTS.mobile, ...file.mobile },
};
