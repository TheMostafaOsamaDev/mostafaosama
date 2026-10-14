"use client";

import { useSyncExternalStore } from "react";
import { NAV_ITEMS, type NavItem, type NavProfile } from "@/components/nav";

/** Space kept free between the nav and the screen edges along its length. */
const MARGIN = 16;
/** A separator is 1px plus 4px margin on each side. */
const SEPARATOR = 9;
const MENU = NAV_ITEMS.find((i) => i.id === "menu")!;
export const MORE: NavItem = { ...MENU, label: "More" };

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** The viewport size as "width x height"; null while rendering on the server. */
export function useViewport(): { width: number; height: number } | null {
  const snap = useSyncExternalStore(
    subscribe,
    () => `${innerWidth}x${innerHeight}`,
    () => null,
  );
  if (!snap) return null;
  const [width, height] = snap.split("x").map(Number);
  return { width, height };
}

let canvas: CanvasRenderingContext2D | null = null;
const widths = new Map<string, number>();
/** Width of a nav label (14px, medium weight, the site's font stack). */
function textWidth(text: string) {
  const cached = widths.get(text);
  if (cached !== undefined) return cached;
  canvas ??= document.createElement("canvas").getContext("2d");
  if (!canvas) return text.length * 8;
  canvas.font = `500 14px ${getComputedStyle(document.body).fontFamily}`;
  const w = Math.ceil(canvas.measureText(text).width) + 2;
  widths.set(text, w);
  return w;
}

/** The smallest item the nav shrinks to before it moves anything into the menu (still above WCAG's 24px). */
const MIN_ITEM = 36;

type Size = Pick<NavProfile, "itemSize" | "iconSize" | "padding" | "gap">;

export type Fit = {
  items: NavItem[];
  labels: NavProfile["labels"];
  /** Smaller sizes, when the configured ones don't fit. */
  size: Size | null;
  /** False when separators were dropped to make room. */
  separators: boolean;
  /** Items moved into the menu because the bar ran out of room. */
  overflow: NavItem[];
};

/**
 * Fits the nav to the screen, in this order, stopping at the first that fits:
 *   1. the configured nav;
 *   2. without inline names (icons keep their tooltips and accessible names);
 *   3. without separators (they only decorate);
 *   4. smaller: items shrink 2px at a time down to 36px, with tighter padding and gaps;
 *   5. items move into the menu, links first, then pages from the end. Tools stay; the menu lists every page and
 *      link, so nothing becomes unreachable.
 */
export function fitNav(
  s: NavProfile,
  items: NavItem[],
  viewport: { width: number; height: number } | null,
  insetStart: number,
): Fit {
  const full: Fit = { items, labels: s.labels, size: null, separators: s.separators, overflow: [] };
  if (!viewport) return full;
  const vertical = s.position === "left" || s.position === "right";
  const room = (vertical ? viewport.height : viewport.width - insetStart) - 2 * MARGIN;

  const length = (list: NavItem[], labels: NavProfile["labels"], z: Size = s, seps = s.separators) => {
    const itemLength = (item: NavItem) => {
      if (vertical || item.kind !== "page") return z.itemSize;
      if (labels === "always")
        return Math.max(z.itemSize, (z.itemSize - z.iconSize) / 2 + z.iconSize + 8 + textWidth(item.label) + 14);
      if (labels === "text") return Math.max(z.itemSize, 28 + textWidth(item.label));
      return z.itemSize;
    };
    let total = 2 * z.padding + 2;
    let children = 0;
    list.forEach((item, i) => {
      if (seps && i > 0 && list[i - 1].kind !== item.kind) {
        total += SEPARATOR;
        children++;
      }
      total += itemLength(item);
      children++;
    });
    // The current page's name opens inline in "active" mode; leave room for the longest one.
    if (labels === "active" && !vertical)
      total += Math.max(0, ...list.filter((i) => i.kind === "page").map((i) => textWidth(i.label) + 18));
    return total + z.gap * Math.max(0, children - 1);
  };

  if (length(items, s.labels) <= room) return full;
  const icons: NavProfile["labels"] = s.labels === "none" ? "none" : "tooltip";
  if (length(items, icons) <= room) return { ...full, labels: icons };
  if (length(items, icons, s, false) <= room) return { ...full, labels: icons, separators: false };

  for (let itemSize = s.itemSize - 2; itemSize >= MIN_ITEM; itemSize -= 2) {
    const size = {
      itemSize,
      iconSize: Math.min(s.iconSize, itemSize - 16),
      padding: Math.min(s.padding, 4),
      gap: Math.min(s.gap, 2),
    };
    if (length(items, icons, size, false) <= room) return { ...full, labels: icons, size, separators: false };
  }

  const smallest = {
    itemSize: MIN_ITEM,
    iconSize: Math.min(s.iconSize, MIN_ITEM - 16),
    padding: Math.min(s.padding, 4),
    gap: Math.min(s.gap, 2),
  };
  const size = s.itemSize > MIN_ITEM ? smallest : null;
  const withMenu = (list: NavItem[]) => (list.some((i) => i.id === "menu") ? list : [...list, MORE]);
  const order = [
    ...items.filter((i) => i.kind === "link").reverse(),
    ...items.filter((i) => i.kind === "page").reverse(),
  ];
  let kept = items;
  for (const drop of order) {
    kept = kept.filter((i) => i !== drop);
    const list = withMenu(kept);
    if (length(list, icons, size ?? s, false) <= room)
      return { items: list, labels: icons, size, separators: false, overflow: items.filter((i) => !kept.includes(i)) };
  }
  return {
    items: withMenu(kept),
    labels: icons,
    size,
    separators: false,
    overflow: items.filter((i) => !kept.includes(i)),
  };
}
