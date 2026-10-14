import type { CSSProperties, ReactNode } from "react";
import { buttonSettings, type ButtonSettings } from "./button-settings";
import "./buttons.css";

export type ButtonKind = "primary" | "secondary" | "link" | "icon";

/** The attributes buttons.css and ButtonEffects read: look, size, and how strongly it pulls toward the cursor. */
export function buttonAttrs(kind: ButtonKind, s: ButtonSettings) {
  const isLink = kind === "link";
  return {
    className: isLink ? "btn-link" : "btn",
    "data-kind": kind,
    "data-look": kind === "primary" ? s.look : isLink ? undefined : s.secondary,
    "data-link": isLink ? s.link : undefined,
    "data-accent": s.accent,
    "data-shape": s.shape,
    "data-size": s.size,
    "data-spring": s.spring,
    // Main and secondary buttons fill with the primary colour on hover (the .btn-fill oval, see buttons.css).
    "data-fill": hasFill(kind, s) ? s.fill : undefined,
    "data-shadow": s.shadow ? "" : undefined,
    "data-press": s.press ? "" : undefined,
    // Magnetic: ButtonEffects reads these. Text links don't move; their text would wobble.
    "data-magnetic": isLink || !s.strength ? undefined : `${s.strength} ${s.follow}`,
    // Speeds: buttons.css reads them, and ButtonEffects reads the fill time.
    style: {
      "--fill-time": `${s.fillTime}s`,
      "--follow-time": `${s.followTime}s`,
      "--release-time": `${s.releaseTime}s`,
    } as CSSProperties,
  };
}

export const hasFill = (kind: ButtonKind, s: ButtonSettings) =>
  s.fill !== "none" && (kind === "primary" || kind === "secondary");

/** The oval that rises over the button on hover; ButtonEffects animates it. */
export const fillLayer = <span aria-hidden className="btn-fill" />;

export const arrowIcon = (
  <svg aria-hidden className="btn-arrow" viewBox="0 0 16 16" width="16" height="16">
    <path
      d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Every button on the site: magnetic (it leans toward the cursor, see ButtonEffects) in the saved look
 * (buttons.settings.json). CSS only, apart from that one shared script. With `href` it renders a link, otherwise a
 * <button>. `icon` sits before or after the label (the `icons` setting). Buttons that show their work (email,
 * download, send) are in StatusButtons.
 */
export function Button({
  kind = "primary",
  href,
  children,
  label,
  disabled,
  external,
  settings = buttonSettings,
  type = "button",
  icon,
}: {
  kind?: ButtonKind;
  href?: string;
  children: ReactNode;
  /** Accessible name for icon buttons (their content is an icon). */
  label?: string;
  disabled?: boolean;
  external?: boolean;
  settings?: ButtonSettings;
  type?: "button" | "submit";
  /** A small icon for the label (mail, download…), placed by the `icons` setting. */
  icon?: ReactNode;
}) {
  const s = settings;
  const attrs = { ...buttonAttrs(kind, s), "aria-label": label };
  const glyph = icon && kind !== "icon" && s.icons !== "none" && (
    <span aria-hidden className="btn-icon">
      {icon}
    </span>
  );
  const content = (
    <>
      {hasFill(kind, s) && fillLayer}
      {glyph && s.icons === "start" && glyph}
      <span className="btn-label">{children}</span>
      {glyph && s.icons === "end" && glyph}
      {kind === "link" && s.link === "arrow" && arrowIcon}
    </>
  );
  if (href && !disabled)
    return (
      <a href={href} {...attrs} {...(external && { target: "_blank", rel: "noreferrer" })}>
        {content}
      </a>
    );
  return (
    <button type={type} disabled={disabled} {...attrs}>
      {content}
    </button>
  );
}
