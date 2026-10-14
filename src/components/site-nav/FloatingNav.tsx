"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { EMAIL, NAV_ITEMS, type NavConfig, type NavItem, type NavItemId, type NavProfile } from "@/components/nav";
import { setTheme, usePreferences } from "@/components/preferences";
import { homePath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { NavIcon, type IconId } from "./icons";
import "./nav.css";
import { fitNav, useViewport } from "./fit";
import { MenuBody, SearchPalette, SettingsBody } from "./NavPanels";

gsap.registerPlugin(useGSAP);

const EASES: Record<NavProfile["ease"], string> = {
  smooth: "power2.out",
  snappy: "power4.out",
  expo: "expo.out",
  back: "back.out(1.6)",
  elastic: "elastic.out(1, 0.7)",
};

const PAGES = NAV_ITEMS.filter((i) => i.kind === "page");
type PanelId = "menu" | "settings";
type Side = NavProfile["position"];
type Box = { x: number; y: number; width: number; height: number };

/** Unit vector from the nav towards the screen edge it sits on. Entrances come from there; hiding goes there. */
const OUTWARD: Record<Side, [number, number]> = { bottom: [0, 1], top: [0, -1], left: [-1, 0], right: [1, 0] };
const TIP_SIDE: Record<Side, string> = { bottom: "above", top: "below", left: "right", right: "left" };

/** True from the desktop breakpoint up. Assumes desktop while rendering on the server. */
export function useIsDesktop(breakpoint: number) {
  const query = `(min-width: ${breakpoint}px)`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
}

/**
 * Sets where the "reveal" page transition starts: the clicked control, in the coordinates of the page element that
 * the new page will replace (pages start at the top of the document after navigating).
 */
function markOrigin(el: HTMLElement) {
  const page = Array.from(document.querySelectorAll<HTMLElement>("[data-page]")).find(
    (p) => p.getClientRects().length > 0,
  );
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const p = page?.getBoundingClientRect() ?? new DOMRect();
  const root = document.documentElement.style;
  root.setProperty("--pt-x", `${cx - p.left}px`);
  root.setProperty("--pt-y", `${cy - (p.top + window.scrollY)}px`);
  root.setProperty("--pt-r", `${Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))}px`);
}

/** The marker's box for an item: the whole item (pill), or a dot / bar under it (beside it on a side rail). */
function markerBox(el: HTMLElement, kind: NavProfile["indicator"], side: Side): Box {
  const [L, T, W, H] = [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight];
  if (kind === "pill") return { x: L, y: T, width: W, height: H };
  const dot = kind === "dot";
  if (side === "left" || side === "right") {
    const x = side === "left" ? L + W - (dot ? 6 : 3) : L + (dot ? 2 : 1);
    return dot ? { x, y: T + H / 2 - 2, width: 4, height: 4 } : { x, y: T + H / 2 - 8, width: 2, height: 16 };
  }
  const y = T + H - (dot ? 6 : 3);
  return dot ? { x: L + W / 2 - 2, y, width: 4, height: 4 } : { x: L + W / 2 - 8, y, width: 16, height: 2 };
}

const boxOf = (el: Element): Box => ({
  x: Number(gsap.getProperty(el, "x")),
  y: Number(gsap.getProperty(el, "y")),
  width: Number(gsap.getProperty(el, "width")),
  height: Number(gsap.getProperty(el, "height")),
});

/** Swaps an icon with a small turn, e.g. menu ↔ close, sun ↔ moon, copy → check. */
function SwapIcon({ children, swapKey, duration }: { children: ReactNode; swapKey: string; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(swapKey);
  useLayoutEffect(() => {
    if (prev.current === swapKey) return;
    prev.current = swapKey;
    if (duration && ref.current)
      gsap.fromTo(
        ref.current,
        { rotate: -90, scale: 0.4, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration, ease: "back.out(2)" },
      );
  }, [swapKey, duration]);
  return (
    <span ref={ref} className="flex">
      {children}
    </span>
  );
}

export function FloatingNav({
  config,
  base,
  replay,
  insetStart = 0,
  sections = false,
  revealAfter = "start",
}: {
  config: NavConfig;
  base: string;
  replay: number;
  /** Width covered on the left (the studio panel); the nav centres in the rest. Matches --nav-offset-start. */
  insetStart?: number;
  /**
   * One scrolling page: page items jump to the matching `<section id data-section>` on the home page (smooth scroll),
   * and the marker follows the section being read. Off: page items are routes.
   */
  sections?: boolean;
  /**
   * With scroll "reveal" (the nav slides in) or "bare" (its surface fades in): as soon as the page scrolls, or only
   * while past the first section.
   */
  revealAfter?: "start" | "hero";
}) {
  const { t, locale } = useI18n();
  const desktop = useIsDesktop(config.breakpoint);
  const profile = desktop ? config.desktop : config.mobile;
  // What fits this screen: the configured nav, or a smaller one (see fit.ts).
  const viewport = useViewport();
  const fit = fitNav(
    profile,
    profile.items
      .map((id) => NAV_ITEMS.find((i) => i.id === id))
      .filter((i) => i !== undefined)
      .map((i) => ({ ...i, label: t.nav.items[i.id] })),
    viewport,
    insetStart,
  );
  const s =
    fit.size || fit.separators !== profile.separators
      ? { ...profile, ...fit.size, separators: fit.separators }
      : profile;
  const prefs = usePreferences();
  const reduced = prefs?.reduced ?? false;
  const pathname = usePathname();
  const home = base || "/";
  const onHome = pathname === home;
  // Sections mode: the section in view (scrollspy), set by the effect below.
  const [spy, setSpy] = useState<NavItemId | null>(null);
  const routeActive = sections
    ? onHome
      ? (spy ?? "home")
      : null
    : (PAGES.find((p) => (base + p.href || "/") === pathname)?.id ?? null);
  // The marker moves on click, not when the route commits, so it answers the click immediately.
  const [pending, setPending] = useState<{ id: NavItemId; from: string } | null>(null);
  const active = pending && pending.from === pathname ? pending.id : routeActive;
  const [open, setOpen] = useState<PanelId | null>(null);
  const [shown, setShown] = useState<PanelId>("menu");
  const [search, setSearch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<NavItemId, HTMLElement | null>>>({});

  const side = s.position;
  const vertical = side === "left" || side === "right";
  const [ox, oy] = OUTWARD[side];
  const d = reduced ? 0 : s.duration;
  const ease = EASES[s.ease];
  const shellSize = s.itemSize + 2 * s.padding;
  const shellRadius = s.shape === "pill" ? shellSize / 2 : s.shape === "rounded" ? 16 : 10;
  const itemRadius = s.shape === "pill" ? s.itemSize / 2 : Math.max(4, shellRadius - s.padding);
  const panelStyle = vertical && s.panel === "morph" ? "popover" : s.panel;
  // Menu and Settings open a panel; without either in the bar, no panel is rendered at all.
  const hasPanel = s.items.some((id) => id === "menu" || id === "settings") || fit.overflow.length > 0;
  const has = (id: NavItemId) => s.items.includes(id);
  const shownItems = fit.items;
  const labels = fit.labels;
  const itemsKey = shownItems.map((i) => i.id).join();

  // ── Current-page marker (and the inline label of the current page) ─────────────────────────────────────
  const prevActive = useRef<NavItemId | null | undefined>(undefined);
  useLayoutEffect(() => {
    const row = rowRef.current;
    const ind = indRef.current;
    if (!row || !ind) return;
    const animate = prevActive.current !== undefined && prevActive.current !== active && d > 0;
    prevActive.current = active;

    // Labels first: the marker's target depends on the final sizes. Item positions are sums of label sizes, so
    // tweening labels and marker with the same duration and ease keeps them in step.
    const labels = Array.from(row.querySelectorAll<HTMLElement>("[data-nav-label]"));
    const from = labels.map((l) => l.getBoundingClientRect().width);
    labels.forEach((l) => {
      gsap.killTweensOf(l);
      gsap.set(l, { width: l.dataset.navLabel === active ? "auto" : 0 });
    });
    const to = labels.map((l) => l.getBoundingClientRect().width);
    if (animate) labels.forEach((l, i) => gsap.fromTo(l, { width: from[i] }, { width: to[i], duration: d, ease }));

    const el = active ? row.querySelector<HTMLElement>(`[data-nav-id="${active}"]`) : null;
    gsap.killTweensOf(ind);
    if (!el || s.indicator === "none") return void gsap.set(ind, { autoAlpha: 0 });
    const t = markerBox(el, s.indicator, side);
    if (!animate || Number(gsap.getProperty(ind, "opacity")) < 0.01) {
      gsap.set(ind, t);
      gsap.to(ind, { autoAlpha: 1, duration: animate ? d * 0.6 : 0 });
    } else if (s.indicatorMotion === "slide") {
      gsap.to(ind, { ...t, duration: d, ease });
    } else if (s.indicatorMotion === "fade") {
      gsap
        .timeline()
        .to(ind, { autoAlpha: 0, duration: d * 0.35, ease: "power1.in" })
        .set(ind, t)
        .to(ind, { autoAlpha: 1, duration: d * 0.65, ease });
    } else {
      // Stretch: reach the new item first, then let go of the old one.
      const c = boxOf(ind);
      const x = Math.min(c.x, t.x);
      const y = Math.min(c.y, t.y);
      const union = {
        x,
        y,
        width: Math.max(c.x + c.width, t.x + t.width) - x,
        height: Math.max(c.y + c.height, t.y + t.height) - y,
      };
      gsap
        .timeline()
        .to(ind, { ...union, duration: d * 0.45, ease: "power2.in" })
        .to(ind, { ...t, duration: d * 0.55, ease });
    }
  }, [
    active,
    d,
    ease,
    side,
    vertical,
    s.indicator,
    s.indicatorMotion,
    labels,
    s.itemSize,
    s.iconSize,
    s.gap,
    itemsKey,
    s.separators,
    s.library,
    s.stroke,
  ]);

  // Keep the marker on its item while the row changes size (fonts loading, Back to top appearing, resizes).
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  });
  useEffect(() => {
    const row = rowRef.current;
    const ind = indRef.current;
    if (!row || !ind) return;
    const ro = new ResizeObserver(() => {
      const el = row.querySelector<HTMLElement>(`[data-nav-id="${activeRef.current}"]`);
      if (el && s.indicator !== "none" && !gsap.isTweening(ind)) gsap.set(ind, markerBox(el, s.indicator, side));
    });
    ro.observe(row);
    return () => ro.disconnect();
  }, [s.indicator, side]);

  // A side rail takes a column of the screen: publish its width so the page can keep its content clear of it.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !vertical) return;
    const root = document.documentElement.style;
    const prop = `--nav-inset-${side}`;
    const ro = new ResizeObserver(() => root.setProperty(prop, `${nav.offsetWidth + s.offset + 16}px`));
    ro.observe(nav);
    return () => {
      ro.disconnect();
      root.removeProperty(prop);
    };
  }, [vertical, side, s.offset]);

  // ── Entrance ────────────────────────────────────────────────────────────────────────────────────────────
  useGSAP(
    () => {
      const shell = shellRef.current;
      const row = rowRef.current;
      // In "reveal" the nav starts hidden and slides in on scroll; that slide is its entrance.
      if (!shell || !row || reduced || s.entrance === "none" || s.scroll === "reveal") return;
      const items = row.querySelectorAll("[data-nav-id], [data-nav-sep]");
      const dur = s.duration;
      const far = s.offset + shellSize + 24;
      if (s.entrance === "rise") gsap.from(shell, { x: 24 * ox, y: 24 * oy, autoAlpha: 0, duration: dur * 1.4, ease });
      if (s.entrance === "drop") gsap.from(shell, { x: far * ox, y: far * oy, duration: dur * 1.6, ease });
      if (s.entrance === "grow")
        gsap
          .timeline()
          .from(shell, { scale: 0.35, autoAlpha: 0, duration: dur, ease })
          .from(items, { autoAlpha: 0, scale: 0.4, stagger: 0.035, duration: dur * 0.8, ease }, "<0.08");
      if (s.entrance === "stagger")
        gsap
          .timeline()
          .from(shell, { autoAlpha: 0, duration: 0.2 })
          .from(items, { autoAlpha: 0, x: 12 * ox, y: 12 * oy, stagger: 0.045, duration: dur, ease }, "<");
    },
    { dependencies: [replay, desktop], scope: shellRef, revertOnUpdate: true },
  );

  // ── Scroll: tuck away or shrink while scrolling down; show Back to top after a screen ───────────────────
  const busy = useRef(false);
  useEffect(() => {
    busy.current = open !== null || search;
  });
  const reveal = useRef<() => void>(() => {});
  useEffect(() => {
    const layer = scrollRef.current;
    const nav = navRef.current;
    const shell = shellRef.current;
    if (!layer || !nav || !shell) return;
    // Stop a tuck still in flight first, or it finishes after the reset and leaves the nav half off-screen.
    gsap.killTweensOf(layer);
    gsap.set(layer, { clearProps: "transform" });
    let last = window.scrollY;
    let tucked = false;
    // The mouse is near the nav's place (it moves only its inner layer, so the nav's own box stays put).
    let near = false;
    // The first call places the nav without animating (in "reveal" it starts hidden at the top of the page).
    let first = true;
    const reveals = s.scroll === "reveal";
    // Bare: the items stay; the surface (background, blur, border, shadow) fades in past the first section.
    const bares = s.scroll === "bare";
    shell.toggleAttribute("data-bare", false);
    const tuck = (on: boolean) => {
      if (on === tucked || s.scroll === "static") return;
      tucked = on;
      const vars =
        s.scroll === "shrink" ? { scale: on ? 0.84 : 1 } : { xPercent: on ? 190 * ox : 0, yPercent: on ? 190 * oy : 0 };
      gsap.to(layer, {
        ...vars,
        transformOrigin: `${50 + 50 * ox}% ${50 + 50 * oy}%`,
        duration: reduced || first ? 0 : 0.4,
        ease: on ? "power2.in" : "power3.out",
      });
    };
    // "hero": hidden while the first section is the one being read (the same line the section tracking uses, a
    // third of the way down the screen), shown once it's left, hidden again on the way back. "start": after 80px.
    const revealAt = () => {
      const hero = revealAfter === "hero" ? document.querySelector<HTMLElement>("[data-section]") : null;
      return hero ? hero.offsetTop + hero.offsetHeight - innerHeight * 0.35 : 80;
    };
    reveal.current = () => tuck(false);
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      setShowTop(y > innerHeight * 0.8);
      // Reveal: hidden over the top of the page, shown once it scrolls (and while a panel is open).
      if (reveals) return tuck(!busy.current && y < revealAt());
      if (bares) return void shell.toggleAttribute("data-bare", !busy.current && y < revealAt());
      // Back at the end of the page: nothing left to read, so the nav is what comes next.
      const atEnd = y + innerHeight >= document.documentElement.scrollHeight - 8;
      if (busy.current || near || y < 80 || atEnd) return tuck(false);
      if (Math.abs(dy) > 4) tuck(dy > 0);
    };
    const onPointer = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse" || reveals || bares) return;
      const r = nav.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      near = Math.hypot(dx, dy) < 64;
      if (near) tuck(false);
    };
    onScroll();
    first = false;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      gsap.killTweensOf(layer);
      shell.removeAttribute("data-bare");
    };
  }, [s.scroll, ox, oy, reduced, revealAfter]);

  // ── Sections: follow the section being read, and scroll to one on click ────────────────────────────────
  // True while a click-scroll is under way, so the marker doesn't walk through the sections it passes.
  const spyLock = useRef(false);
  const lockTimer = useRef(0);
  useEffect(() => {
    if (!sections || !onHome) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (spyLock.current) return;
      const all = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      if (!all.length) return;
      // The section crossing a line a third of the way down the screen; the last one at the very bottom.
      const line = innerHeight * 0.35;
      let id = all[0].id;
      for (const el of all) if (el.getBoundingClientRect().top <= line) id = el.id;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = all[all.length - 1].id;
      setSpy(id as NavItemId);
    };
    const onScroll = () => void (raf ||= requestAnimationFrame(measure));
    const onEnd = () => {
      spyLock.current = false;
      onScroll();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("scrollend", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scrollend", onEnd);
    };
  }, [sections, onHome]);

  /** Scrolls to a section on this page. False when it isn't here (the link then navigates to the home page). */
  const goTo = (id: NavItemId) => {
    const el = document.getElementById(id);
    if (!sections || !onHome || !el) return false;
    const behavior = reduced ? "auto" : "smooth";
    if (id === "home") window.scrollTo({ top: 0, behavior });
    else el.scrollIntoView({ behavior, block: "start" });
    history.replaceState(null, "", id === "home" ? home : `${home}#${id}`);
    // Released when the scroll ends (scrollend), or after a while where that event isn't supported.
    spyLock.current = true;
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => void (spyLock.current = false), reduced ? 50 : 1200);
    setSpy(id);
    return true;
  };
  const hrefFor = (item: NavItem) =>
    sections ? (item.id === "home" ? home : `${home}#${item.id}`) : base + item.href || "/";

  // Back to top folds in and out of the row along its length.
  const topMounted = useRef(false);
  useLayoutEffect(() => {
    const li = rowRef.current?.querySelector<HTMLElement>('[data-collapsible="top"]');
    if (!li) return void (topMounted.current = false);
    const size = vertical ? "height" : "width";
    const instant = !topMounted.current || !d;
    topMounted.current = true;
    gsap.killTweensOf(li);
    if (showTop) {
      gsap.set(li, { display: "flex" });
      gsap.fromTo(
        li,
        { [size]: instant ? "auto" : 0, opacity: instant ? 1 : 0, scale: instant ? 1 : 0.5 },
        { [size]: "auto", opacity: 1, scale: 1, duration: instant ? 0 : d, ease, clearProps: size },
      );
    } else {
      gsap.to(li, {
        [size]: 0,
        opacity: 0,
        scale: 0.5,
        duration: instant ? 0 : d * 0.7,
        ease: "power2.in",
        onComplete: () => void gsap.set(li, { display: "none", clearProps: size }),
      });
    }
  }, [showTop, vertical, d, ease, itemsKey]);

  // ── Panels (menu, settings) ─────────────────────────────────────────────────────────────────────────────
  const lastH = useRef(0);
  const prevPanel = useRef<{ open: PanelId | null; style: string } | null>(null);
  useLayoutEffect(() => {
    const box = panelRef.current;
    const shell = shellRef.current;
    const row = rowRef.current;
    if (!box || !shell || !row) return;
    const prev = prevPanel.current;
    prevPanel.current = { open, style: panelStyle };
    const restyled = !prev || prev.style !== panelStyle;
    const was = restyled ? null : prev.open;
    const remember = () => void (lastH.current = box.offsetHeight);
    const content = () => {
      if (!d) return;
      const items = box.querySelectorAll("[data-panel-item]");
      if (s.panelContent === "stagger")
        gsap.from(items, {
          x: -8 * ox,
          y: -8 * oy || 8,
          opacity: 0,
          stagger: 0.025,
          duration: d,
          ease,
          delay: d * 0.12,
        });
      if (s.panelContent === "fade") gsap.from(box.firstElementChild, { opacity: 0, duration: d, delay: d * 0.1 });
    };
    const focusFirst = () => box.querySelector<HTMLElement>("a, button, input")?.focus({ preventScroll: true });
    const width = Math.max(row.offsetWidth, 288);

    if (open && was && open !== was) {
      // Switching between menu and settings: grow or shrink to the new content.
      gsap.fromTo(box, { height: lastH.current }, { height: "auto", duration: d * 0.8, ease, onComplete: remember });
      content();
      focusFirst();
      return;
    }
    if (open) {
      gsap.set(box, { visibility: "visible" });
      if (panelStyle === "morph") {
        gsap.set(box.firstElementChild, { width });
        gsap.fromTo(
          box,
          { height: 0, width: row.offsetWidth, opacity: 0 },
          { height: "auto", width, opacity: 1, duration: d, ease, onComplete: remember },
        );
        gsap.to(shell, { borderRadius: Math.min(shellRadius, 22), duration: d, ease });
      } else if (panelStyle === "popover") {
        gsap.fromTo(
          box,
          { opacity: 0, scale: 0.92, x: 8 * ox, y: 8 * oy, transformOrigin: `${50 + 50 * ox}% ${50 + 50 * oy}%` },
          { opacity: 1, scale: 1, x: 0, y: 0, duration: d, ease, onComplete: remember },
        );
      } else {
        gsap.set(backdropRef.current, { visibility: "visible" });
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: d });
        gsap.fromTo(box, { yPercent: 100 }, { yPercent: 0, duration: d * 1.2, ease: "expo.out", onComplete: remember });
      }
      content();
      focusFirst();
      return;
    }
    const dur = was ? d * 0.7 : 0;
    const hide = () => void gsap.set(box, { visibility: "hidden" });
    if (panelStyle === "morph") {
      gsap.to(box, {
        height: 0,
        width: was ? row.offsetWidth : 0,
        opacity: 0,
        duration: dur,
        ease: "power2.inOut",
        onComplete: () => void gsap.set(box, { visibility: "hidden", width: 0 }),
      });
      gsap.to(shell, { borderRadius: shellRadius, duration: dur, ease: "power2.inOut" });
    } else if (panelStyle === "popover") {
      gsap.to(box, { opacity: 0, scale: 0.96, duration: dur, ease: "power2.in", onComplete: hide });
    } else {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: dur,
        onComplete: () => void gsap.set(backdropRef.current, { visibility: "hidden" }),
      });
      gsap.to(box, { yPercent: 100, duration: dur, ease: "power2.in", onComplete: hide });
    }
    // Only these drive the panel; the other values are read at the moment they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, panelStyle, shown]);

  const togglePanel = (id: PanelId) => {
    setShown(id);
    setOpen((o) => (o === id ? null : id));
  };
  const closePanel = useCallback((focusTrigger: boolean) => {
    setOpen((o) => {
      if (o && focusTrigger) triggers.current[o]?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closePanel(true);
      // The bottom sheet is modal: keep Tab inside it.
      const box = panelRef.current;
      if (e.key !== "Tab" || panelStyle !== "sheet" || !box) return;
      const f = Array.from(box.querySelectorAll<HTMLElement>("a, button, input"));
      const [first, last] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const onDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (!navRef.current?.contains(t) && !panelRef.current?.contains(t)) closePanel(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, panelStyle, closePanel]);

  // ⌘K / Ctrl+K, or / outside text fields, opens search.
  const hasSearch = has("search");
  useEffect(() => {
    if (!hasSearch) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(null);
        setSearch((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hasSearch]);

  // ── Tools ───────────────────────────────────────────────────────────────────────────────────────────────
  const copyTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).then(
      () => {
        setCopied(true);
        window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
      },
      () => (location.href = `mailto:${EMAIL}`),
    );
  };
  const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  const switchTheme = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTheme(prefs?.dark ? "light" : "dark", config.themeSwitch, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  // ── Hover and press ─────────────────────────────────────────────────────────────────────────────────────
  const hoverOn = !reduced;
  const onEnter = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !hoverOn) return;
    const el = e.currentTarget;
    const glyph = el.querySelector("[data-glyph]");
    const micro = el.querySelector("[data-micro]");
    if (s.hover === "bubble" && bubbleRef.current) {
      const b = bubbleRef.current;
      const t = markerBox(el, "pill", side);
      if (Number(gsap.getProperty(b, "opacity")) < 0.01) gsap.set(b, t);
      gsap.to(b, { ...t, autoAlpha: 1, duration: s.duration * 0.6, ease, overwrite: "auto" });
    }
    if (s.hover === "lift" && glyph)
      gsap.to(glyph, { x: -3 * ox, y: -3 * oy, duration: s.duration * 0.5, ease, overwrite: "auto" });
    if (!micro) return;
    if (s.iconHover === "bounce")
      gsap.fromTo(
        micro,
        { x: 0, y: 0 },
        { x: -5 * ox, y: -5 * oy, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 },
      );
    if (s.iconHover === "wiggle")
      gsap.fromTo(micro, { rotate: 0 }, { keyframes: { rotate: [0, -14, 10, -6, 0] }, duration: 0.5, ease: "none" });
    if (s.iconHover === "tilt") gsap.to(micro, { rotate: -12, scale: 1.1, duration: 0.25, ease: "back.out(2)" });
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (s.hover === "lift") gsap.to(el.querySelector("[data-glyph]"), { x: 0, y: 0, duration: s.duration * 0.5, ease });
    if (s.iconHover === "tilt") gsap.to(el.querySelector("[data-micro]"), { rotate: 0, scale: 1, duration: 0.25 });
    if (s.press) gsap.to(el, { scale: 1, duration: 0.3, ease: "back.out(2)" });
  };
  const onRowMove = (e: PointerEvent<HTMLUListElement>) => {
    if (s.hover !== "magnify" || !hoverOn || e.pointerType !== "mouse") return;
    e.currentTarget.querySelectorAll<HTMLElement>("[data-glyph]").forEach((g) => {
      const r = g.getBoundingClientRect();
      const dist = vertical ? e.clientY - (r.top + r.height / 2) : e.clientX - (r.left + r.width / 2);
      const k = Math.max(0, 1 - Math.abs(dist) / (s.itemSize * 2.2));
      const t = k * k * (3 - 2 * k);
      const push = -t * s.itemSize * 0.22;
      gsap.to(g, {
        scale: 1 + 0.5 * t,
        x: push * ox,
        y: push * oy,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };
  const onRowLeave = (e: PointerEvent<HTMLUListElement>) => {
    if (bubbleRef.current) gsap.to(bubbleRef.current, { autoAlpha: 0, duration: s.duration * 0.5, overwrite: "auto" });
    if (s.hover === "magnify")
      gsap.to(e.currentTarget.querySelectorAll("[data-glyph]"), {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
  };
  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (s.press && !reduced) gsap.to(e.currentTarget, { scale: 0.9, duration: 0.12, ease: "power2.out" });
  };
  const onUp = (e: PointerEvent<HTMLElement>) => {
    if (s.press) gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "back.out(2)" });
  };

  const onPage = (e: MouseEvent<HTMLElement>, item: NavItem) => {
    setOpen(null);
    if (sections) {
      if (goTo(item.id)) e.preventDefault();
      return;
    }
    markOrigin(e.currentTarget);
    if (item.id !== active) setPending({ id: item.id, from: pathname });
  };
  const direction = (id: NavItemId) => {
    const from = PAGES.findIndex((p) => p.id === active);
    return PAGES.findIndex((p) => p.id === id) >= from ? "nav-forward" : "nav-back";
  };
  const iconStyle = (id: NavItemId) => ({
    size: s.iconSize,
    stroke: s.stroke,
    phosphorWeight: s.phosphorWeight,
    filled: s.activeIcon === "filled" && id === active,
  });

  // ── Render ──────────────────────────────────────────────────────────────────────────────────────────────
  const toolState: Partial<Record<NavItemId, { icon: IconId; label: string }>> = {
    theme: prefs?.dark ? { icon: "sun", label: t.nav.toLight } : { icon: "moon", label: t.nav.toDark },
    copy: copied ? { icon: "check", label: t.nav.copied } : { icon: "copy", label: t.nav.items.copy },
    // "More" when the menu only appears because items overflowed into it.
    menu:
      open === "menu"
        ? { icon: "close", label: t.nav.closeMenu }
        : { icon: "menu", label: s.items.includes("menu") ? t.nav.items.menu : t.nav.more },
    settings:
      open === "settings"
        ? { icon: "close", label: t.nav.closeSettings }
        : { icon: "settings", label: t.nav.items.settings },
  };

  const renderItem = (item: NavItem) => {
    const isPage = item.kind === "page";
    const textOnly = isPage && labels === "text";
    const inline = isPage && (labels === "always" || textOnly);
    const animated = isPage && labels === "active";
    const tool = toolState[item.id];
    const icon = tool?.icon ?? item.id;
    const label = tool?.label ?? item.label;
    const tip = labels !== "none" && !inline && !(animated && item.id === active);
    const props = {
      "data-nav-id": item.id,
      "aria-label": inline ? undefined : label,
      className: `nav-item group relative flex shrink-0 items-center ${vertical && inline ? "justify-start" : "justify-center"}`,
      style: {
        height: s.itemSize,
        minWidth: s.itemSize,
        borderRadius: itemRadius,
        ...(textOnly && { paddingInline: 14 }),
        ...(inline && !textOnly && { paddingInlineStart: (s.itemSize - s.iconSize) / 2, paddingInlineEnd: 14 }),
      } as CSSProperties,
      onPointerEnter: onEnter,
      onPointerLeave: onLeave,
      onPointerDown: onDown,
      onPointerUp: onUp,
    };
    const body = (
      <>
        {!textOnly && (
          <span data-glyph className="nav-glyph flex">
            <span data-micro className="flex">
              <SwapIcon swapKey={icon} duration={d * 0.8}>
                <NavIcon library={s.library} id={icon} style={iconStyle(item.id)} />
              </SwapIcon>
            </span>
          </span>
        )}
        {inline && (
          <span className={`nav-text text-sm font-medium whitespace-nowrap ${textOnly ? "" : "ps-2"}`}>
            {item.label}
          </span>
        )}
        {animated && (
          <span
            data-nav-label={item.id}
            aria-hidden
            className="overflow-hidden text-sm font-medium whitespace-nowrap"
            style={{ width: 0 }}
          >
            <span className="block ps-1.5 pe-3">{item.label}</span>
          </span>
        )}
        {tip && (
          <span aria-hidden className="nav-tip" data-side={TIP_SIDE[side]}>
            {label}
            {item.id === "search" && <kbd>⌘K</kbd>}
          </span>
        )}
      </>
    );
    const ref = (el: HTMLElement | null) => void (triggers.current[item.id] = el);
    // Sections are plain in-page links: Next's <Link> rendered "/#about" as "/about" on the server (16.4), and
    // jumping within the page doesn't need the router anyway.
    if (isPage && sections)
      return (
        <a
          href={hrefFor(item)}
          aria-current={item.id === active ? "location" : undefined}
          onClick={(e) => onPage(e, item)}
          {...props}
        >
          {body}
        </a>
      );
    if (isPage)
      return (
        <Link
          href={hrefFor(item)}
          transitionTypes={sections ? undefined : [direction(item.id)]}
          aria-current={item.id === active ? "page" : undefined}
          onClick={(e) => onPage(e, item)}
          {...props}
        >
          {body}
        </Link>
      );
    if (item.id === "lang") {
      const other: Locale = locale === "ar" ? "en" : "ar";
      return (
        <a
          href={homePath(other)}
          hrefLang={other}
          lang={other}
          // A plain link to the other language's home: it opens at the top (the owner's choice), not at the
          // section being read.
          {...props}
          aria-label={t.nav.langLabel}
        >
          {body}
        </a>
      );
    }
    if (item.kind === "link")
      return (
        <a href={item.href} {...(item.id === "email" ? {} : { target: "_blank", rel: "noreferrer" })} {...props}>
          {body}
        </a>
      );
    const panel = item.id === "menu" || item.id === "settings" ? (item.id as PanelId) : null;
    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={panel ? open === panel : item.id === "search" ? search : undefined}
        aria-haspopup={panel || item.id === "search" ? "dialog" : undefined}
        onClick={(e) => {
          if (panel) togglePanel(panel);
          else if (item.id === "search") {
            setOpen(null);
            setSearch(true);
          } else if (item.id === "theme") switchTheme(e);
          else if (item.id === "copy") copyEmail();
          else if (item.id === "top") toTop();
        }}
        {...props}
      >
        {body}
      </button>
    );
  };

  const list: ReactNode[] = [];
  shownItems.forEach((item, i) => {
    const prev = shownItems[i - 1];
    if (s.separators && prev && prev.kind !== item.kind)
      list.push(
        <li
          key={`sep-${item.id}`}
          aria-hidden
          data-nav-sep
          className="nav-sep"
          style={
            vertical
              ? { height: 1, width: s.itemSize * 0.45, marginBlock: 4 }
              : { width: 1, height: s.itemSize * 0.45, marginInline: 4 }
          }
        />,
      );
    list.push(
      <li key={item.id} className="flex" data-collapsible={item.id === "top" ? "top" : undefined}>
        {renderItem(item)}
      </li>,
    );
  });

  const panelBody =
    shown === "menu" ? (
      <MenuBody
        profile={s}
        hrefFor={hrefFor}
        active={active}
        iconStyle={iconStyle}
        direction={direction}
        onPage={onPage}
        withSettings={!has("settings")}
        config={config}
        prefs={prefs}
      />
    ) : (
      <SettingsBody config={config} prefs={prefs} />
    );
  const surface = { "data-surface": s.surface, "data-shadow": s.shadow };
  // Glass blur and tint; the sheet renders outside the nav, so it gets them too.
  const glass = {
    "--glass-blur": `${s.glassBlur}px`,
    "--glass-tint": `${s.glassTint}%`,
    // The colour boost only makes sense with a blur; at 0px the glass is a plain tint.
    "--glass-sat": s.glassBlur ? 1.6 : 1,
  } as CSSProperties;
  const panelLabel = shown === "menu" ? t.nav.items.menu : t.nav.items.settings;
  // Popovers centre on the nav, which is centred on the screen, so they stay on screen at any width.
  const popoverPos: Record<Side, string> = {
    bottom: "bottom-full left-1/2 mb-3 -translate-x-1/2",
    top: "top-full left-1/2 mt-3 -translate-x-1/2",
    left: "top-1/2 left-full ml-3 -translate-y-1/2",
    right: "top-1/2 right-full mr-3 -translate-y-1/2",
  };
  // Panels never grow past the screen: they scroll inside instead (short laptop screens, phones in landscape).
  const panelMax = vertical ? "calc(100dvh - 32px)" : `calc(100dvh - ${s.offset + shellSize + 40}px)`;

  // Distance from the screen edge, plus the notch / home-indicator area on phones.
  const edge = `calc(${s.offset}px + env(safe-area-inset-${side}, 0px))`;
  const anchor: CSSProperties = vertical
    ? {
        top: "50%",
        translate: "0 -50%",
        [side]: side === "left" ? `calc(var(--nav-offset-start, 0px) + ${edge})` : edge,
      }
    : {
        [side]: edge,
        left: "calc(var(--nav-offset-start, 0px) + (100% - var(--nav-offset-start, 0px)) / 2)",
        translate: "-50% 0",
      };

  return (
    <nav
      ref={navRef}
      aria-label={t.nav.label}
      className="site-nav fixed z-40"
      style={{ ...anchor, "--tip-gap": `${s.padding + 10}px` } as CSSProperties}
      onFocusCapture={() => reveal.current()}
    >
      <span className="sr-only" aria-live="polite">
        {copied ? t.nav.copiedLive : ""}
      </span>
      <div ref={scrollRef}>
        <div
          ref={shellRef}
          {...surface}
          data-panel-open={open ? "" : undefined}
          className={`nav-shell relative flex items-center ${vertical ? "flex-row" : side === "bottom" ? "flex-col" : "flex-col-reverse"}`}
          style={{ padding: s.padding, borderRadius: shellRadius, ...glass }}
        >
          {hasPanel && panelStyle === "morph" && (
            <div
              ref={panelRef}
              role="region"
              aria-label={panelLabel}
              inert={!open}
              className="overflow-hidden"
              style={{ height: 0, width: 0, opacity: 0, visibility: "hidden" }}
            >
              <div
                className={`overflow-y-auto overscroll-contain ${side === "bottom" ? "pb-1.5" : "pt-1.5"}`}
                style={{ maxHeight: panelMax }}
              >
                {panelBody}
              </div>
            </div>
          )}
          <ul
            ref={rowRef}
            className={`relative flex ${vertical ? "flex-col items-stretch" : "items-center"}`}
            style={{ gap: s.gap }}
            onPointerMove={onRowMove}
            onPointerLeave={onRowLeave}
          >
            <span
              ref={bubbleRef}
              aria-hidden
              className="nav-bubble pointer-events-none absolute top-0 left-0 opacity-0"
              style={{ borderRadius: itemRadius }}
            />
            <span
              ref={indRef}
              aria-hidden
              className={`nav-indicator pointer-events-none absolute top-0 left-0 opacity-0 nav-indicator-${s.indicator}`}
              style={{ borderRadius: s.indicator === "pill" ? itemRadius : 2 }}
            />
            {list}
          </ul>
          {hasPanel && panelStyle === "popover" && (
            // The wrapper places the popover (CSS translate); GSAP animates only the panel inside, so the two
            // never fight over the same transform.
            <div className={`absolute w-72 max-w-[calc(100vw-32px)] ${popoverPos[side]}`}>
              <div
                ref={panelRef}
                role="region"
                aria-label={panelLabel}
                inert={!open}
                {...surface}
                className="nav-shell overflow-y-auto overscroll-contain"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  borderRadius: Math.min(shellRadius, 18),
                  maxHeight: panelMax,
                }}
              >
                {panelBody}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* The sheet and the palette are modal and full-width, so they render outside the nav's transformed box. */}
      {prefs &&
        hasPanel &&
        panelStyle === "sheet" &&
        createPortal(
          <div inert={!open}>
            <div
              ref={backdropRef}
              className="nav-backdrop fixed inset-0 z-[55]"
              style={{ opacity: 0, visibility: "hidden" }}
              onClick={() => closePanel(true)}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={panelLabel}
              {...surface}
              className="nav-shell fixed inset-x-0 bottom-0 z-[56] mx-auto max-h-[85dvh] max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl px-2 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]"
              style={{ visibility: "hidden", ...glass }}
            >
              <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-current opacity-20" />
              {panelBody}
            </div>
          </div>,
          document.body,
        )}
      {prefs && hasSearch && (
        <SearchPalette
          open={search}
          onClose={() => {
            setSearch(false);
            triggers.current.search?.focus();
          }}
          base={base}
          goTo={sections ? (id) => void goTo(id) : undefined}
          profile={s}
          iconStyle={iconStyle}
          direction={direction}
          prefs={prefs}
          config={config}
          actions={{ copy: copyEmail, top: toTop }}
          reduced={reduced}
        />
      )}
    </nav>
  );
}
