"use client";

import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { NAV_ITEMS, type NavItem, type NavItemId, type NavProfile, type NavConfig } from "@/components/nav";
import { setMotion, setTheme, type Preferences } from "@/components/preferences";
import { useI18n } from "@/i18n/I18nProvider";
import { NavIcon, type IconId } from "./icons";

export type IconStyleFor = (id: NavItemId) => {
  size: number;
  stroke: number;
  phosphorWeight: NavProfile["phosphorWeight"];
  filled: boolean;
};

const PAGES = NAV_ITEMS.filter((i) => i.kind === "page");
const LINKS = NAV_ITEMS.filter((i) => i.kind === "link");
const external = (item: NavItem) => (item.id === "email" ? {} : { target: "_blank", rel: "noreferrer" });

/** Every page and link with its name, plus preferences when the nav has no Settings item. */
export function MenuBody({
  profile,
  hrefFor,
  active,
  iconStyle,
  direction,
  onPage,
  withSettings,
  config,
  prefs,
}: {
  profile: NavProfile;
  hrefFor: (item: NavItem) => string;
  active: NavItemId | null;
  iconStyle: IconStyleFor;
  direction: (id: NavItemId) => string;
  onPage: (e: MouseEvent<HTMLElement>, item: NavItem) => void;
  withSettings: boolean;
  config: NavConfig;
  prefs: Preferences | null;
}) {
  const { t } = useI18n();
  const row = (item: NavItem) => {
    const content = (
      <>
        <NavIcon library={profile.library} id={item.id} style={{ ...iconStyle(item.id), size: 18 }} />
        <span className="flex-1">{t.nav.items[item.id]}</span>
        {item.kind === "link" && (
          <span aria-hidden className="inline-block text-xs opacity-50 rtl:-scale-x-100">
            ↗
          </span>
        )}
      </>
    );
    const cls = "nav-panel-link flex items-center gap-3 rounded-lg px-3 py-2 text-sm";
    return (
      <li key={item.id} data-panel-item>
        {item.kind === "page" && hrefFor(item).includes("#") ? (
          <a
            href={hrefFor(item)}
            aria-current={item.id === active ? "location" : undefined}
            onClick={(e) => onPage(e, item)}
            className={cls}
          >
            {content}
          </a>
        ) : item.kind === "page" ? (
          <Link
            href={hrefFor(item)}
            transitionTypes={[direction(item.id)]}
            aria-current={item.id === active ? "page" : undefined}
            onClick={(e) => onPage(e, item)}
            className={cls}
          >
            {content}
          </Link>
        ) : (
          <a href={item.href} {...external(item)} className={cls}>
            {content}
          </a>
        )}
      </li>
    );
  };
  return (
    <div className="space-y-3 p-1">
      <ul className="flex flex-col gap-0.5">{PAGES.map(row)}</ul>
      <div>
        <p data-panel-item className="nav-panel-heading px-3 pb-1">
          {t.nav.elsewhere}
        </p>
        <ul className="flex flex-col gap-0.5">{LINKS.map(row)}</ul>
      </div>
      {withSettings && <SettingsBody config={config} prefs={prefs} />}
    </div>
  );
}

/** Theme and motion preferences. */
export function SettingsBody({ config, prefs }: { config: NavConfig; prefs: Preferences | null }) {
  const id = useId();
  const { t } = useI18n();
  const seg = <T extends string>(
    name: string,
    value: T | undefined,
    options: [T, string][],
    onPick: (v: T, e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => (
    <fieldset data-panel-item className="px-2">
      <legend className="nav-panel-heading mb-1.5 px-1">{name}</legend>
      <div className="nav-seg">
        {options.map(([v, label]) => (
          <label key={v}>
            <input
              type="radio"
              name={`${id}-${name}`}
              className="sr-only"
              checked={value === v}
              onChange={(e) => onPick(v, e)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div className="space-y-3 p-1 pb-2">
      {seg(
        t.nav.theme,
        prefs?.theme,
        [
          ["system", t.nav.system],
          ["light", t.nav.light],
          ["dark", t.nav.dark],
        ],
        (v, e) => {
          const r = (e.target.parentElement as HTMLElement).getBoundingClientRect();
          setTheme(v, config.themeSwitch, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        },
      )}
      {seg(
        t.nav.motion,
        prefs?.motion,
        [
          ["system", t.nav.system],
          ["reduce", t.nav.reduced],
          ["full", t.nav.full],
        ],
        (v) => setMotion(v),
      )}
    </div>
  );
}

type Command = { key: string; label: string; hint: string; icon: IconId; keywords?: string; run: () => void };

/**
 * The search palette (⌘K): pages, links and actions, filtered as you type. Arrow keys move, Enter runs, Escape
 * closes. It is a modal dialog: focus stays in the input while it's open and returns to the opener afterwards.
 */
export function SearchPalette({
  open,
  onClose,
  base,
  goTo,
  profile,
  iconStyle,
  direction,
  prefs,
  config,
  actions,
  reduced,
}: {
  open: boolean;
  onClose: () => void;
  base: string;
  /** Sections mode: scroll to a section instead of navigating. */
  goTo?: (id: NavItemId) => void;
  profile: NavProfile;
  iconStyle: IconStyleFor;
  direction: (id: NavItemId) => string;
  prefs: Preferences | null;
  config: NavConfig;
  actions: { copy: () => void; top: () => void };
  reduced: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const ts = t.nav.search;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    ...PAGES.map((p) => ({
      key: p.id,
      label: t.nav.items[p.id],
      hint: ts.page,
      icon: p.id as IconId,
      run: () => (goTo ? goTo(p.id) : router.push(base + p.href || "/", { transitionTypes: [direction(p.id)] })),
    })),
    ...LINKS.map((l) => ({
      key: l.id,
      label: t.nav.items[l.id],
      hint: l.id === "cv" ? ts.pdf : ts.link,
      icon: l.id as IconId,
      run: () => (l.id === "email" ? (location.href = l.href) : void window.open(l.href, "_blank", "noreferrer")),
    })),
    {
      key: "theme",
      label: prefs?.dark ? ts.toLight : ts.toDark,
      hint: ts.action,
      icon: prefs?.dark ? "sun" : "moon",
      keywords: "theme dark light mode colour color",
      run: () => setTheme(prefs?.dark ? "light" : "dark", config.themeSwitch),
    },
    { key: "copy", label: ts.copy, hint: ts.action, icon: "copy", keywords: "mail", run: actions.copy },
    { key: "top", label: ts.top, hint: ts.action, icon: "top", keywords: "scroll up", run: actions.top },
  ];
  const q = query.trim().toLowerCase();
  const results = q ? commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q)) : commands;
  const current = Math.min(index, Math.max(0, results.length - 1));

  const mounted = useRef(false);
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const dialog = dialogRef.current;
    if (!backdrop || !dialog) return;
    const first = !mounted.current;
    mounted.current = true;
    const d = reduced || first ? 0 : 0.28;
    if (open) {
      gsap.set([backdrop, dialog], { visibility: "visible" });
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: d });
      gsap.fromTo(
        dialog,
        { opacity: 0, scale: 0.96, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: d * 1.2, ease: "power3.out" },
      );
      if (d)
        gsap.from(dialog.querySelectorAll("li"), { opacity: 0, y: -4, stagger: 0.015, duration: 0.25, delay: 0.05 });
      inputRef.current?.focus();
    } else {
      gsap.to([backdrop, dialog], {
        opacity: 0,
        duration: d * 0.7,
        onComplete: () => void gsap.set([backdrop, dialog], { visibility: "hidden" }),
      });
    }
  }, [open, reduced]);

  const close = () => {
    setQuery("");
    setIndex(0);
    onClose();
  };
  const run = (c: Command | undefined) => {
    if (!c) return;
    close();
    c.run();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setIndex((current + step + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") e.preventDefault();
  };

  return createPortal(
    <div inert={!open}>
      <div
        ref={backdropRef}
        className="nav-backdrop fixed inset-0 z-[60]"
        style={{ visibility: "hidden", opacity: 0 }}
        onClick={close}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ts.label}
        data-surface="solid"
        data-shadow="floating"
        className="nav-shell fixed top-[14vh] left-1/2 z-[61] w-[min(560px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-2xl"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <div className="flex items-center gap-3 border-b border-current/10 px-4">
          <NavIcon library={profile.library} id="search" style={{ ...iconStyle("search"), size: 18 }} />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[current] ? `${listId}-${results[current].key}` : undefined}
            aria-label={ts.placeholder}
            placeholder={ts.placeholder}
            className="nav-palette-input h-12 flex-1 text-[15px]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKey}
          />
          <kbd className="text-xs opacity-50">esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label={ts.results} className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.map((c, i) => (
            <li
              key={c.key}
              id={`${listId}-${c.key}`}
              role="option"
              aria-selected={i === current}
              data-highlight={i === current || undefined}
              className="nav-panel-link flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
              onPointerMove={() => setIndex(i)}
              onClick={() => run(c)}
            >
              <NavIcon library={profile.library} id={c.icon} style={{ ...iconStyle("search"), size: 18 }} />
              <span className="flex-1">{c.label}</span>
              <span className="text-xs opacity-50">{c.hint}</span>
            </li>
          ))}
          {!results.length && (
            <li className="px-3 py-6 text-center text-sm opacity-60">
              {ts.none} “{query}”.
            </li>
          )}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
