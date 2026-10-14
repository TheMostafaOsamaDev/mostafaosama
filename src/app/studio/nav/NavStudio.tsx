"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  BREAKPOINT_RANGE,
  ITEM_NOTES,
  NAV_ITEMS,
  NAV_OPTIONS,
  NAV_PRESETS,
  NAV_RANGES,
  SHARED_OPTIONS,
  presetProfile,
  type Device,
  type NavConfig,
  type NavItemId,
  type NavProfile,
} from "@/components/nav";
import { setMotion, setTheme, usePreferences, type MotionPref, type ThemePref } from "@/components/preferences";
import { FloatingNav, useIsDesktop } from "@/components/site-nav/FloatingNav";
import { NavIconContext } from "@/components/site-nav/icons";
import { usePageTransition } from "@/components/site-nav/usePageTransition";
import { Choice, Section, Segmented, Slider, Toggle } from "../controls";
import { LIBRARIES, NavIcon, renderAnyIcon } from "./icons";

const BASE = "/studio/nav";
const MESSAGE = "nav-studio";
type Message = { type: typeof MESSAGE; config: NavConfig; theme: ThemePref; motion: MotionPref; replay: number };

/** One line under a choice, saying what the selected option does. */
const HINTS: Record<string, Record<string, string>> = {
  activeIcon: {
    same: "Same icon on every item.",
    filled: "The current page's icon is filled (where the library has one).",
  },
  position: {
    bottom: "Floating at the bottom centre. Thumb-friendly on phones.",
    top: "Floating at the top centre. Conventional on desktop.",
    left: "A vertical rail on the left, centred top to bottom. Desktop only in practice.",
    right: "A vertical rail on the right. Sits under the glow corner.",
  },
  surface: {
    solid: "Opaque, a shade off the page.",
    glass: "Translucent; blurs whatever scrolls under it.",
    outline: "Page colour with a firm border.",
    inverted: "Ink pill with page-colour icons. Loudest option.",
  },
  shadow: {
    none: "Flat on the page.",
    soft: "Barely lifted.",
    raised: "Lifted, with a highlight on the top edge (like the reference).",
    floating: "Deep shadow; clearly above the page.",
  },
  shape: { pill: "Fully rounded ends.", rounded: "16px corners.", soft: "10px corners; more tool-like." },
  labels: {
    tooltip: "Icons only; names appear on hover and keyboard focus.",
    active: "The current page shows its name inline; others use tooltips.",
    always: "Pages show icon and name; links and tools stay icons with tooltips.",
    text: "Pages show their name only, no icon; links and tools stay icons.",
    none: "Icons only (names stay available to screen readers).",
  },
  entrance: {
    none: "There from the first frame.",
    rise: "Fades in from its edge of the screen.",
    grow: "The pill grows from its centre, then the icons pop in.",
    drop: "Slides in from off-screen.",
    stagger: "Icons arrive one after another.",
  },
  indicator: {
    none: "No marker; only the current icon is full strength.",
    pill: "A soft highlight behind the current page.",
    dot: "A small dot beside the current page.",
    line: "A short bar beside the current page.",
  },
  indicatorMotion: {
    slide: "Glides to the new page.",
    stretch: "Reaches the new page first, then lets go of the old one.",
    fade: "Fades out, reappears at the new page.",
  },
  hover: {
    none: "No hover response beyond full-strength icons.",
    bubble: "A light highlight follows the pointer from item to item.",
    lift: "The hovered icon moves a few pixels towards the page.",
    magnify: "Icons near the pointer grow, like the macOS dock.",
  },
  iconHover: {
    none: "Icons stay still.",
    bounce: "A quick hop.",
    wiggle: "A short shake.",
    tilt: "Leans and grows while hovered.",
  },
  scroll: {
    static: "Always visible.",
    hide: "Tucks away while scrolling down, returns on any scroll up.",
    shrink: "Gets smaller while scrolling down.",
    reveal: "Hidden at the top of the page; slides in once you scroll, and stays.",
    bare: "No background or border over the first section; they fade in once you scroll past it.",
  },
  panel: {
    morph: "The pill itself grows into the panel. (Side rails use a popover.)",
    popover: "A separate card opens beside the nav.",
    sheet: "A sheet slides up from the bottom over a dimmed page. Best on phones.",
  },
  panelContent: {
    stagger: "Rows arrive one after another.",
    fade: "The content fades in as a whole.",
    none: "Content is there as soon as the panel opens.",
  },
  ease: {
    smooth: "power2.out: a gentle stop.",
    snappy: "power4.out: quick, then settles.",
    expo: "expo.out: fast start, long glide.",
    back: "back.out: a slight overshoot.",
    elastic: "elastic.out: springy. Give it a longer duration.",
  },
  page: {
    none: "Instant swap.",
    fade: "Cross-fade.",
    rise: "Fades in while moving up.",
    blur: "Fades through a blur.",
    scale: "Fades with a slight zoom.",
    slide: "Moves sideways, following the order of the nav.",
    wipe: "The new page wipes across in the direction of the nav.",
    reveal: "The new page opens as a circle from the control you clicked.",
  },
  pageEase: {
    out: "Decelerates; the usual choice for arrivals.",
    "in-out": "Accelerates, then decelerates.",
    emphasized: "Material's emphasized curve: long, soft landing.",
    linear: "Constant speed.",
  },
  pageMode: { overlap: "Old and new animate together.", sequential: "The old page leaves, then the new one arrives." },
  themeSwitch: {
    instant: "Colours change at once.",
    fade: "The whole page cross-fades to the new theme.",
    circle: "The new theme spreads as a circle from the button you pressed.",
  },
};

const noop = () => () => {};

/** In the phone frame the studio runs embedded: no panel, settings arrive from the parent window. */
export function NavStudio({ saved, children }: { saved: NavConfig; children: ReactNode }) {
  const embedded = useSyncExternalStore(
    noop,
    () => window.self !== window.top,
    () => false,
  );
  // The studio's nav draws with every icon library; the site's draws only the chosen one.
  return (
    <NavIconContext value={renderAnyIcon}>
      {embedded ? <Embedded saved={saved}>{children}</Embedded> : <Studio saved={saved}>{children}</Studio>}
    </NavIconContext>
  );
}

function Embedded({ saved, children }: { saved: NavConfig; children: ReactNode }) {
  const [config, setConfig] = useState(saved);
  const [replay, setReplay] = useState(0);
  usePageTransition(config);
  useEffect(() => {
    const onMessage = (e: MessageEvent<Message>) => {
      if (e.origin !== location.origin || e.data?.type !== MESSAGE) return;
      setConfig(e.data.config);
      setReplay(e.data.replay);
      if (document.documentElement.dataset.theme !== e.data.theme) setTheme(e.data.theme);
      setMotion(e.data.motion);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: `${MESSAGE}:ready` }, location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <>
      {children}
      <FloatingNav config={config} base={BASE} replay={replay} />
    </>
  );
}

function Studio({ saved, children }: { saved: NavConfig; children: ReactNode }) {
  const [config, setConfig] = useState(saved);
  const [baseline, setBaseline] = useState(saved);
  const [device, setDevice] = useState<Device>("desktop");
  const [replay, setReplay] = useState(0);
  const [panel, setPanel] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const prefs = usePreferences();
  // The panel takes its own column from 1024px (lg); below that it floats over the page.
  const wide = useIsDesktop(1024);
  const frame = useRef<HTMLIFrameElement>(null);
  const p = config[device];
  const other: Device = device === "desktop" ? "mobile" : "desktop";
  const dirty = JSON.stringify(config) !== JSON.stringify(baseline);
  usePageTransition(config);

  // Keep the phone preview in sync, including when it (re)loads.
  const message = useRef<Message | null>(null);
  useEffect(() => {
    if (!prefs) return;
    message.current = { type: MESSAGE, config, theme: prefs.theme, motion: prefs.motion, replay };
    frame.current?.contentWindow?.postMessage(message.current, location.origin);
  }, [config, prefs, replay, device]);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === `${MESSAGE}:ready` && message.current)
        frame.current?.contentWindow?.postMessage(message.current, location.origin);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const set = <K extends keyof NavProfile>(key: K, value: NavProfile[K]) => {
    setConfig((c) => ({ ...c, [device]: { ...c[device], [key]: value } }));
    setStatus(null);
    if (key === "entrance" || key === "ease" || key === "position") setReplay((r) => r + 1);
  };
  const setShared = <K extends "breakpoint" | "themeSwitch">(key: K, value: NavConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
    setStatus(null);
  };
  const applyPreset = (name: string) => {
    setConfig((c) => ({ ...c, [device]: presetProfile(name) }));
    setReplay((r) => r + 1);
    setStatus(null);
  };

  const save = async () => {
    setStatus("Saving…");
    const res = await fetch(`${BASE}/save`, { method: "POST", body: JSON.stringify(config) }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { error?: string } | null;
    if (res?.ok) {
      setBaseline(config);
      setStatus("Saved to src/components/nav.settings.json");
    } else setStatus(body?.error ?? "Couldn't save. Is `next dev` running?");
  };

  const choice = <K extends keyof typeof NAV_OPTIONS>(key: K, label: string, extra?: string) => (
    <Choice
      label={label}
      options={NAV_OPTIONS[key] as readonly string[]}
      value={p[key] as string}
      onChange={(v) => set(key, v as NavProfile[K])}
      hint={extra ?? HINTS[key]?.[p[key] as string]}
    />
  );
  const slider = <K extends keyof typeof NAV_RANGES>(
    key: K,
    label: string,
    unit: string,
    note?: string,
    disabled?: boolean,
  ) => {
    const [min, max, step] = NAV_RANGES[key];
    return (
      <Slider
        label={label}
        unit={unit}
        min={min}
        max={max}
        step={step}
        value={p[key] as number}
        onChange={(v) => set(key, v as NavProfile[K])}
        note={note}
        disabled={disabled}
      />
    );
  };

  const lib = LIBRARIES[p.library];
  const vertical = p.position === "left" || p.position === "right";
  const toggleItem = (id: NavItemId, on: boolean) => {
    if (!on)
      return set(
        "items",
        p.items.filter((i) => i !== id),
      );
    const items = [...p.items];
    // New items go before the menu if the menu is last, so it stays at the end.
    const at = items[items.length - 1] === "menu" ? items.length - 1 : items.length;
    items.splice(at, 0, id);
    set("items", items);
  };
  const move = (id: NavItemId, by: number) => {
    const items = [...p.items];
    const i = items.indexOf(id);
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    set("items", items);
  };
  const ordered = [
    ...p.items.map((id) => NAV_ITEMS.find((i) => i.id === id)!),
    ...NAV_ITEMS.filter((i) => !p.items.includes(i.id)),
  ];

  return (
    <div className={`min-h-dvh ${panel ? "lg:[--nav-offset-start:360px]" : ""}`}>
      {/* Pages keep clear of the studio panel and of a side rail, if the nav is one. */}
      <div className="pr-[var(--nav-inset-right,0px)] pl-[calc(var(--nav-offset-start,0px)+var(--nav-inset-left,0px))]">
        {children}
      </div>

      <FloatingNav config={config} base={BASE} replay={replay} insetStart={panel && wide ? 360 : 0} />

      {device === "mobile" && (
        <div className="fixed inset-y-0 right-0 left-[var(--nav-offset-start,0px)] z-[45] flex flex-col items-center justify-center gap-3 bg-paper/75 backdrop-blur-md">
          <p className="text-xs text-muted">Mobile preview · 390px wide (below the {config.breakpoint}px breakpoint)</p>
          <div className="h-[min(844px,calc(100dvh-72px))] w-[390px] max-w-[calc(100%-32px)] overflow-hidden rounded-[44px] border-[10px] border-ink/85 bg-paper shadow-2xl">
            <iframe ref={frame} src={BASE} title="Mobile preview" className="size-full" />
          </div>
        </div>
      )}

      {panel ? (
        <aside
          aria-label="Nav studio controls"
          className="studio-panel fixed inset-y-0 left-0 z-50 flex w-[360px] max-w-full flex-col border-r border-ink/10 bg-paper/95 text-sm backdrop-blur-md"
          style={{ viewTransitionName: "studio-panel" }}
        >
          <header className="space-y-3 border-b border-ink/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Nav studio</h2>
              {dirty && <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs text-muted">unsaved</span>}
              <div className="ml-auto flex gap-1.5">
                <button type="button" className="studio-btn" disabled={!dirty} onClick={() => setConfig(baseline)}>
                  Revert
                </button>
                <button type="button" className="studio-btn studio-btn-primary" onClick={save}>
                  Save
                </button>
                <button type="button" className="studio-btn" aria-label="Hide controls" onClick={() => setPanel(false)}>
                  ←
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                label="Editing"
                options={["desktop", "mobile"]}
                value={device}
                onChange={(v) => setDevice(v as Device)}
              />
              <button
                type="button"
                className="studio-btn ml-auto text-xs"
                onClick={() => setConfig((c) => ({ ...c, [other]: { ...c[device] } }))}
                title={`Replace the ${other} nav with this one`}
              >
                Copy to {other}
              </button>
            </div>
            {status && (
              <p role="status" className="text-xs text-muted">
                {status}
              </p>
            )}
          </header>

          <div className="flex-1 space-y-7 overflow-y-auto px-4 pt-5 pb-10">
            <Section title="Presets" note={`Replaces the ${device} nav. Everything stays adjustable.`}>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NAV_PRESETS).map(([name, preset]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => applyPreset(name)}
                    className="rounded-lg border border-ink/10 p-2.5 text-left transition-colors hover:border-ink/30"
                  >
                    <span className="flex items-baseline justify-between gap-1">
                      <span className="font-medium">{name}</span>
                      {preset.best !== device && <span className="text-[11px] text-muted">{preset.best}</span>}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{preset.note}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section
              title="Sections"
              note="Tick what goes in the nav and order it with the arrows. A separator goes between pages, links and tools."
            >
              <ul className="divide-y divide-ink/8 rounded-lg border border-ink/10">
                {ordered.map((item) => {
                  const on = p.items.includes(item.id);
                  const i = p.items.indexOf(item.id);
                  return (
                    <li key={item.id} className="flex items-start gap-2.5 px-2.5 py-2">
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={on}
                        onChange={(e) => toggleItem(item.id, e.target.checked)}
                        className="mt-0.5 size-4 accent-current"
                      />
                      <NavIcon
                        library={p.library}
                        id={item.id}
                        style={{ size: 16, stroke: p.stroke, phosphorWeight: p.phosphorWeight, filled: false }}
                      />
                      <label htmlFor={`item-${item.id}`} className={`flex-1 ${on ? "" : "text-muted"}`}>
                        {item.label}
                        <span className="ml-1.5 text-[11px] text-muted">{item.kind}</span>
                        {ITEM_NOTES[item.id] && (
                          <span className="block text-xs leading-snug text-muted">{ITEM_NOTES[item.id]}</span>
                        )}
                      </label>
                      {on && (
                        <span className="flex">
                          <button
                            type="button"
                            className="studio-icon-btn"
                            disabled={i === 0}
                            onClick={() => move(item.id, -1)}
                            aria-label={`Move ${item.label} earlier`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="studio-icon-btn"
                            disabled={i === p.items.length - 1}
                            onClick={() => move(item.id, 1)}
                            aria-label={`Move ${item.label} later`}
                          >
                            ↓
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Toggle label="Separators between groups" checked={p.separators} onChange={(v) => set("separators", v)} />
              {choice("labels", "Labels")}
            </Section>

            <Section title="Icons" note="Each row is your nav in that library, with the current stroke and size.">
              <fieldset className="space-y-1.5">
                <legend className="sr-only">Icon library</legend>
                {NAV_OPTIONS.library.map((id) => {
                  const l = LIBRARIES[id];
                  return (
                    <label
                      key={id}
                      className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-ink/10 p-2.5 transition-colors hover:border-ink/30 has-checked:border-ink has-checked:bg-ink/4 has-focus-visible:outline-2"
                    >
                      <input
                        type="radio"
                        name="library"
                        className="sr-only"
                        checked={p.library === id}
                        onChange={() => set("library", id)}
                      />
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{l.name}</span>
                        <span className="text-xs text-muted">{l.meta}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2.5">
                        {p.items.map((item) => (
                          <NavIcon
                            key={item}
                            library={id}
                            id={item}
                            style={{
                              size: p.iconSize,
                              stroke: p.stroke,
                              phosphorWeight: p.phosphorWeight,
                              filled: p.activeIcon === "filled" && item === "home",
                            }}
                          />
                        ))}
                      </span>
                      {!l.brands && (
                        <span className="text-xs text-muted">
                          No brand logos; GitHub and LinkedIn come from Tabler.
                        </span>
                      )}
                    </label>
                  );
                })}
              </fieldset>
              {slider(
                "stroke",
                "Stroke",
                "",
                lib.stroke
                  ? undefined
                  : `${lib.name} has fixed strokes${p.library === "phosphor" ? "; use Weight" : ""}.`,
                !lib.stroke,
              )}
              {p.library === "phosphor" && choice("phosphorWeight", "Weight")}
              {choice(
                "activeIcon",
                "Current page icon",
                !lib.filled && p.activeIcon === "filled"
                  ? `${lib.name} has no filled set, so this does nothing.`
                  : undefined,
              )}
              {slider("iconSize", "Icon size", "px")}
            </Section>

            <Section title="Layout">
              {choice("position", "Position")}
              {choice("surface", "Surface")}
              {p.surface === "glass" &&
                slider("glassBlur", "Glass blur", "px", "How much the page behind the bar is blurred.")}
              {p.surface === "glass" &&
                slider("glassTint", "Glass opacity", "%", "Lower shows more of the blurred page through the bar.")}
              {choice("shadow", "Shadow")}
              {choice("shape", "Corners")}
              {slider(
                "itemSize",
                "Item size",
                "px",
                p.itemSize < 40 ? "Under 40px is small for touch; 44px is Apple's minimum." : undefined,
              )}
              {slider("padding", "Padding", "px")}
              {slider("gap", "Gap", "px")}
              {slider("offset", "Distance from edge", "px")}
            </Section>

            <Section title="Panels" note="Menu and Settings open a panel; Search always opens a centred palette.">
              {choice(
                "panel",
                "Panel style",
                vertical && p.panel === "morph"
                  ? "Side rails can't grow sideways into a panel, so this shows as a popover."
                  : undefined,
              )}
              {choice("panelContent", "Panel content")}
            </Section>

            <Section title="Nav motion" note="All GSAP. Turned off (or made instant) under reduced motion.">
              {choice("entrance", "Entrance")}
              <button type="button" className="studio-btn" onClick={() => setReplay((r) => r + 1)}>
                Replay entrance
              </button>
              {choice("indicator", "Current page marker")}
              {p.indicator !== "none" && choice("indicatorMotion", "Marker motion")}
              {choice("hover", "Hover")}
              {choice("iconHover", "Icon on hover")}
              <Toggle label="Press: items dip when pressed" checked={p.press} onChange={(v) => set("press", v)} />
              {choice("scroll", "While scrolling")}
              {choice("ease", "Easing")}
              {slider("duration", "Duration", "s")}
            </Section>

            <Section
              title="Page transition"
              note="React's <ViewTransition> on real routes, the way the site will do it. Click the nav to try it."
            >
              {choice("page", "Style")}
              {slider("pageDuration", "Duration", "ms")}
              {!["none", "fade", "wipe", "reveal"].includes(p.page) && slider("pageDistance", "Distance", "px")}
              {choice("pageEase", "Easing")}
              {!["wipe", "reveal", "none"].includes(p.page) && choice("pageMode", "Timing")}
            </Section>

            <Section title="Both devices" note="Shared by the desktop and mobile navs.">
              <Slider
                label="Desktop from"
                unit="px"
                min={BREAKPOINT_RANGE[0]}
                max={BREAKPOINT_RANGE[1]}
                step={BREAKPOINT_RANGE[2]}
                value={config.breakpoint}
                onChange={(v) => setShared("breakpoint", v)}
                note="Narrower windows get the mobile nav. Try resizing the browser."
              />
              <Choice
                label="Theme switch"
                options={SHARED_OPTIONS.themeSwitch}
                value={config.themeSwitch}
                onChange={(v) => setShared("themeSwitch", v as NavConfig["themeSwitch"])}
                hint={HINTS.themeSwitch[config.themeSwitch]}
              />
            </Section>

            <Section title="Preview" note="The visitor's own preferences, as the Settings panel sets them.">
              <Segmented
                label="Theme"
                options={["system", "light", "dark"]}
                value={prefs?.theme ?? "system"}
                onChange={(v) => setTheme(v as ThemePref, config.themeSwitch)}
              />
              <Segmented
                label="Motion"
                options={["system", "reduce", "full"]}
                value={prefs?.motion ?? "system"}
                onChange={(v) => setMotion(v as MotionPref)}
              />
              <p className="text-xs leading-relaxed text-muted">
                Scroll the page to try the scroll behaviour and Back to top. Tab through the nav to check focus; ⌘K
                opens search when it&apos;s in the nav.
              </p>
            </Section>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          className="studio-panel studio-btn fixed top-3 left-3 z-50 bg-paper"
          style={{ viewTransitionName: "studio-panel" }}
          onClick={() => setPanel(true)}
        >
          Controls →
        </button>
      )}
    </div>
  );
}
