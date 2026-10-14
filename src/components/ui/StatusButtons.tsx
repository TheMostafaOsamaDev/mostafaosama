"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { buttonAttrs, fillLayer, hasFill, type ButtonKind } from "./Button";
import { buttonSettings, type ButtonSettings } from "./button-settings";

export type Status = "idle" | "loading" | "done" | "error";
type Labels = Record<Status, string>;
/** Which story the button tells: each has its own icons and click → working → done animation (buttons.css). */
export type Cycle = "download" | "send" | "email";

/** How long "Downloaded" / "Message sent", and a failure, stay before the button is ready again. */
const DONE_FOR = 2600;
const FAILED_FOR = 3200;
/** The download progress never runs faster than one full trace in this long, so it always plays the whole way. */
const TRACE_MS = 1600;
/** It starts once the click animation (the arrow diving into the tray, buttons.css) has played. */
const DIVE_MS = 550;
/** The email button's sealing animation: the flap opens, seals, and the envelope leaves (buttons.css). */
const SEAL_MS = 1000;

/* The cycles' icons, drawn for these animations (24-unit grid, 1.6 stroke, like the site's Hugeicons). Their parts
   carry classes that buttons.css animates; every part rests in its final pose, so reduced motion simply shows it. */
const Glyph = ({ name, children }: { name: string; children: ReactNode }) => (
  <svg className={`cyc-glyph cyc-${name}`} viewBox="0 0 24 24" width="17" height="17" aria-hidden>
    {children}
  </svg>
);
const downloadGlyph = (
  <Glyph name="download">
    <g className="cyc-arrow">
      <path d="M12 3.5v11" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
    </g>
    <path className="cyc-tray" d="M4 15.5v2A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-2" />
  </Glyph>
);
const planeGlyph = (
  <Glyph name="plane">
    <path d="M20.5 3.5 3.5 10.3l7 2.9 2.9 7 7.1-16.7Z" />
    <path d="M10.5 13.2 20.5 3.5" />
  </Glyph>
);
const mailGlyph = (
  <Glyph name="mail">
    <g className="cyc-envelope">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path className="cyc-flap" d="M3.5 6.5 12 12.5l8.5-6" />
      <circle className="cyc-seal" cx="12" cy="12.5" r="1.7" />
    </g>
  </Glyph>
);
const checkGlyph = (ringed: boolean) => (
  <Glyph name="check">
    {ringed && <circle className="cyc-done-ring" cx="12" cy="12" r="9.5" pathLength={1} />}
    <path className="cyc-tick" d={ringed ? "M8 12.3l2.8 2.8L16.2 9.6" : "M5 12.5 9.5 17 19 7.5"} pathLength={1} />
  </Glyph>
);
/** A progress ring: dashes measured in fractions of the circle (pathLength 1), filled by --p. */
const ring = (
  <svg className="btn-ring" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" pathLength={1} />
    <circle cx="10" cy="10" r="8" pathLength={1} />
  </svg>
);
const dots = (
  <span className="btn-dots">
    <span />
    <span />
    <span />
  </span>
);
/** Download progress "outline": a line around the button's edge, drawn to --p (pathLength 1; buttons.css sizes it). */
const outline = (
  <svg aria-hidden className="btn-outline">
    <rect pathLength={1} />
    <rect pathLength={1} />
  </svg>
);
const IDLE: Record<Cycle, ReactNode> = { download: downloadGlyph, send: planeGlyph, email: mailGlyph };

/** While working: the idle icon plays its exit once (dive, take-off, seal), then the busy indicator takes over. */
function busyIcon(cycle: Cycle, s: ButtonSettings) {
  const after =
    cycle === "email"
      ? null
      : cycle === "download"
        ? s.progress === "ring"
          ? ring
          : downloadGlyph
        : s.sending === "dots"
          ? dots
          : s.sending === "spinner"
            ? ring
            : planeGlyph;
  return (
    <>
      <span className="cyc-out">{IDLE[cycle]}</span>
      {after && <span className="cyc-in">{after}</span>}
    </>
  );
}

/** The order labels roll in: earlier ones wait above, later ones below. */
const RANK: Record<Status, number> = { idle: 0, loading: 1, done: 2, error: 2 };

/**
 * A button that shows its work: ready → working → done (or failed), each with its own label and icon, animated as
 * one story per `cycle` (buttons.css). Done and failed are disabled until it settles back to ready. All labels sit
 * in one grid cell, so the button keeps the width of the longest and never jumps; they roll in and out. A visually
 * hidden live region announces each change. `progress` (0–1, or null while the size is unknown) drives the fill,
 * bar or ring.
 */
export function StatusButton({
  kind = "primary",
  status,
  labels,
  cycle,
  progress = null,
  settings: s = buttonSettings,
  href,
  download,
  type = "button",
  onClick,
}: {
  kind?: ButtonKind;
  status: Status;
  labels: Labels;
  cycle: Cycle;
  progress?: number | null;
  settings?: ButtonSettings;
  href?: string;
  download?: string;
  type?: "button" | "submit";
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}) {
  const percent = cycle === "download" && s.percent;
  const icons: Record<Status, ReactNode> = {
    idle: IDLE[cycle],
    loading: busyIcon(cycle, s),
    done: checkGlyph(cycle === "download" && s.progress === "ring"),
    error: <HugeiconsIcon icon={Alert02Icon} size={17} strokeWidth={1.6} />,
  };
  // Downloading without the percentage: an ellipsis whose dots light up in turn.
  const ellipsis = cycle === "download" && !percent;
  const text = (k: Status) =>
    k === "loading" && percent && progress !== null ? `${labels.loading} ${Math.round(progress * 100)}%` : labels[k];
  const base = buttonAttrs(kind, s);
  const settled = status === "done" || status === "error";
  // Locked from the click until it's ready again: working, done and failed take no input.
  const locked = status !== "idle";
  const attrs = {
    ...base,
    // Stays put while it works: no magnetic pull while downloading or sending.
    ...(status === "loading" && { "data-magnetic": undefined }),
    // Done or failed: one flat colour, no fill, no pull (buttons.css).
    ...(settled && { "data-magnetic": undefined, "data-fill": undefined }),
    "aria-disabled": locked || undefined,
    "data-status": status,
    "data-cycle": cycle,
    "data-progress": cycle === "download" ? s.progress : undefined,
    "data-busy":
      cycle === "send" ? s.sending : cycle === "download" ? (s.progress === "ring" ? "ring" : "icon") : "seal",
    "data-known": progress !== null ? "" : undefined,
    "aria-busy": status === "loading" || undefined,
    style: { ...base.style, "--p": progress ?? 0 } as CSSProperties,
    onClick: locked ? (e: MouseEvent<HTMLElement>) => e.preventDefault() : onClick,
  };
  const glyph = s.icons !== "none" && (
    <span aria-hidden className="btn-icon" key={status} data-phase={status}>
      {icons[status]}
    </span>
  );
  const content = (
    <>
      {hasFill(kind, s) && fillLayer}
      {cycle === "download" && s.progress === "outline" && status === "loading" && outline}
      {glyph && s.icons === "start" && glyph}
      <span className="btn-label btn-stack">
        {/* Invisible sizers, one per state at its widest ("… 100%"), so the width never changes… */}
        {(Object.keys(labels) as Status[]).map((k) => (
          <span key={k} aria-hidden data-sizer>
            {labels[k] + (k === "loading" && percent ? " 100%" : k === "loading" && ellipsis ? "..." : "")}
          </span>
        ))}
        {/* …and the labels themselves, rolling: the current one in place, earlier ones above, later ones below. */}
        {(Object.keys(labels) as Status[]).map((k) => (
          <span
            key={`roll-${k}`}
            aria-hidden={k !== status || undefined}
            data-roll={k === status ? "on" : RANK[k] < RANK[status] ? "past" : "next"}
          >
            {text(k)}
            {k === "loading" && ellipsis && (
              <span className="btn-ellipsis">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            )}
          </span>
        ))}
      </span>
      {glyph && s.icons === "end" && glyph}
      <span className="sr-only" role="status" aria-live="polite">
        {status === "idle" ? "" : labels[status]}
      </span>
    </>
  );
  if (href)
    return (
      <a href={href} download={download} {...attrs}>
        {content}
      </a>
    );
  return (
    <button type={type} {...attrs}>
      {content}
    </button>
  );
}

/** Back to ready after showing "done", or a failure, for a moment. */
function useSettle(status: Status, set: (s: Status) => void) {
  useEffect(() => {
    if (status !== "done" && status !== "error") return;
    const t = window.setTimeout(() => set("idle"), status === "done" ? DONE_FOR : FAILED_FOR);
    return () => window.clearTimeout(t);
  }, [status, set]);
}

/**
 * The CV download: fetches the file with real progress (from Content-Length), then saves it under `filename`. Without
 * JavaScript it is a plain download link.
 */
export function DownloadButton({
  href,
  filename,
  labels,
  kind = "secondary",
  settings: s = buttonSettings,
}: {
  href: string;
  filename: string;
  labels: Labels;
  kind?: ButtonKind;
  settings?: ButtonSettings;
}) {
  const [status, setStatus] = useState<Status>("idle");
  // What the button shows (the outline, ring, bar or fill, and the percentage): it chases the real progress
  // smoothly, frame by frame, but never faster than one full trace in TRACE_MS, so even an instant download plays
  // the whole way round before "Downloaded". Null while the size is unknown (the indeterminate look).
  const [shown, setShown] = useState<number | null>(null);
  const running = useRef(false);
  const goal = useRef({ to: 0, known: false });
  useSettle(status, setStatus);

  /**
   * Runs the shown progress every frame; resolves once it has reached 1. It waits for the click animation (the arrow
   * diving into the tray), then follows the smaller of two curves: a timeline that eases in and out over TRACE_MS
   * (so a fast download still traces calmly, starting and landing softly) and a smooth chase of the real progress (so a
   * slow one never runs ahead of the bytes).
   */
  const follow = (stop: { current: boolean }) =>
    new Promise<void>((resolve) => {
      let chase = 0;
      let last = performance.now();
      const t0 = last + DIVE_MS;
      const frame = (now: number) => {
        if (stop.current) return resolve();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const { to, known } = goal.current;
        chase += (to - chase) * (1 - Math.exp(-dt * 5));
        if (to >= 1 && 1 - chase < 0.002) chase = 1;
        const x = Math.min(Math.max((now - t0) / TRACE_MS, 0), 1);
        const timeline = x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
        const p = Math.min(timeline, chase);
        setShown(known ? p : null);
        if (p >= 1) return resolve();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });

  const start = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (running.current) return;
    running.current = true;
    setStatus("loading");
    setShown(null);
    goal.current = { to: 0, known: false };
    const stop = { current: false };
    const traced = follow(stop);
    const reach = (to: number) => (goal.current = { to, known: true });
    try {
      const res = await fetch(href);
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        got += value.length;
        if (total) reach(got / total);
      }
      const url = URL.createObjectURL(new Blob(chunks, { type: res.headers.get("content-type") ?? undefined }));
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      reach(1);
      await traced;
      setStatus("done");
    } catch {
      stop.current = true;
      setStatus("error");
    } finally {
      running.current = false;
    }
  };

  return (
    <StatusButton
      kind={kind}
      status={status}
      labels={labels}
      cycle="download"
      progress={shown}
      settings={s}
      href={href}
      download={filename}
      onClick={start}
    />
  );
}

/** The contact form's submit button. The form owns the request and passes `status`, and returns it to idle. */
export function SendButton({
  status,
  labels,
  settings: s = buttonSettings,
}: {
  status: Status;
  labels: Labels;
  settings?: ButtonSettings;
}) {
  return <StatusButton status={status} labels={labels} cycle="send" settings={s} type="submit" />;
}

/**
 * "Email me": opens the visitor's mail app (a plain mailto link, so it works without JavaScript) and copies the
 * address too, for anyone without one. A mailto link can't report whether a mail app opened, so the button says what
 * it knows: the envelope seals and leaves, then "Address copied" (if copying wasn't allowed, the "Opening mail" label
 * stays as the outcome).
 */
export function EmailButton({
  email,
  labels,
  kind = "primary",
  settings: s = buttonSettings,
}: {
  email: string;
  labels: Omit<Labels, "error">;
  kind?: ButtonKind;
  settings?: ButtonSettings;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(true);
  useSettle(status, setStatus);
  const open = () => {
    if (status !== "idle") return;
    setStatus("loading");
    const copy = navigator.clipboard?.writeText(email) ?? Promise.reject(new Error("no clipboard"));
    const sealed = new Promise((r) => setTimeout(r, SEAL_MS));
    void Promise.allSettled([copy, sealed]).then(([c]) => {
      setCopied(c.status === "fulfilled");
      setStatus("done");
    });
  };
  return (
    <StatusButton
      kind={kind}
      status={status}
      labels={{ ...labels, done: copied ? labels.done : labels.loading, error: labels.done }}
      cycle="email"
      settings={s}
      href={`mailto:${email}`}
      onClick={open}
    />
  );
}
