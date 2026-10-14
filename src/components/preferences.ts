"use client";

import { useSyncExternalStore } from "react";

/**
 * The visitor's theme and motion preferences. "system" follows the OS; a choice is stored on <html> as
 * data-theme / data-motion (which the CSS reads) and remembered in localStorage. preferences-script.ts restores
 * them before the first paint.
 */
export type ThemePref = "system" | "light" | "dark";
export type MotionPref = "system" | "reduce" | "full";
export type Preferences = { theme: ThemePref; motion: MotionPref; dark: boolean; reduced: boolean };

const DARK = "(prefers-color-scheme: dark)";
const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const dark = window.matchMedia(DARK);
  const reduce = window.matchMedia(REDUCE);
  dark.addEventListener("change", onChange);
  reduce.addEventListener("change", onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  return () => {
    dark.removeEventListener("change", onChange);
    reduce.removeEventListener("change", onChange);
    mo.disconnect();
  };
}

// A string snapshot, so useSyncExternalStore sees a stable value between changes.
function snapshot() {
  const { theme = "system", motion = "system" } = document.documentElement.dataset;
  return [theme, motion, +matchMedia(DARK).matches, +matchMedia(REDUCE).matches].join("|");
}

/** The current preferences, resolved against the OS. Null during server rendering. */
export function usePreferences(): Preferences | null {
  const snap = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!snap) return null;
  const [theme, motion, osDark, osReduce] = snap.split("|");
  return {
    theme: theme as ThemePref,
    motion: motion as MotionPref,
    dark: theme === "dark" || (theme === "system" && osDark === "1"),
    reduced: motion === "reduce" || (motion === "system" && osReduce === "1"),
  };
}

function store(key: string, value: string) {
  try {
    if (value === "system") localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the choice then lasts for this page.
  }
}

function apply(attr: "theme" | "motion", value: string) {
  if (value === "system") delete document.documentElement.dataset[attr];
  else document.documentElement.dataset[attr] = value;
}

export type ThemeSwitch = "instant" | "fade" | "circle";

/**
 * Sets the theme. "fade" cross-fades the whole page; "circle" reveals the new theme from `origin` (the button
 * that was pressed). Both use a document view transition; reduced motion always switches instantly.
 */
export function setTheme(theme: ThemePref, how: ThemeSwitch = "instant", origin?: { x: number; y: number }) {
  store("theme", theme);
  const reduced = document.documentElement.dataset.motion === "reduce" || matchMedia(REDUCE).matches;
  if (how === "instant" || reduced || !document.startViewTransition) return apply("theme", theme);
  const root = document.documentElement;
  const x = origin?.x ?? innerWidth / 2;
  const y = origin?.y ?? innerHeight / 2;
  root.style.setProperty("--tv-x", `${x}px`);
  root.style.setProperty("--tv-y", `${y}px`);
  root.style.setProperty("--tv-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  root.classList.add("theme-vt", `theme-vt-${how}`);
  document
    .startViewTransition(() => apply("theme", theme))
    .finished.finally(() => root.classList.remove("theme-vt", `theme-vt-${how}`));
}

export function setMotion(motion: MotionPref) {
  store("motion", motion);
  apply("motion", motion);
}
