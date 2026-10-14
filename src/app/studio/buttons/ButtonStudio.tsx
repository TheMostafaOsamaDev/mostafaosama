"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Download04Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { setTheme, usePreferences, type ThemePref } from "@/components/preferences";
import { NavIcon } from "@/components/site-nav/icons";
import { Button } from "@/components/ui/Button";
import { BUTTON_OPTIONS, BUTTON_RANGES, SPRING_TIMES, type ButtonSettings } from "@/components/ui/button-settings";
import { DownloadButton, EmailButton, SendButton, StatusButton, type Status } from "@/components/ui/StatusButtons";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { Choice, Section, Slider, Toggle, title } from "../controls";
import "../nav/studio.css";

const HINTS: Record<string, Record<string, string>> = {
  look: {
    solid: "Filled with the accent: the strongest call to action.",
    soft: "A light tint of the accent.",
    outline: "A thin accent border.",
  },
  secondary: {
    outline: "Bordered: clearly a button, quieter than the main one.",
    soft: "A light tint.",
    ghost: "Text only until hovered; the quietest.",
  },
  accent: {
    ink: "Black on light, white on dark; the primary colour shows on hover (Fill).",
    primary: "The primary colour all the time.",
  },
  fill: {
    rise: "Hovering fills the button with the primary colour: an oval rises from below and leaves through the top.",
    none: "No fill on hover.",
  },
  shape: { pill: "Fully rounded; matches the nav.", rounded: "12px corners.", square: "6px corners." },
  size: { sm: "36px tall.", md: "44px tall: the comfortable touch size.", lg: "52px tall." },
  icons: { end: "Icon after the label.", start: "Icon before the label.", none: "Text only." },
  spring: {
    elastic: "Snaps back with an elastic wobble, like dennissnellenberg.com.",
    soft: "Settles back gently.",
    snappy: "Returns quickly, no overshoot.",
    bouncy: "Overshoots a little on the way back.",
  },
  progress: {
    outline: "A line traces the button's outline as the file arrives, then closes into the done border.",
    fill: "The button fills from the start edge as the file arrives.",
    bar: "A thin bar along the bottom fills.",
    ring: "The icon becomes a ring that fills.",
  },
  sending: {
    plane: "The paper plane takes off and comes round again.",
    dots: "Three dots breathe in turn.",
    spinner: "A ring turns.",
  },
  link: { grow: "The underline draws in.", slide: "The underline leaves and comes back.", arrow: "An arrow nudges." },
};

/** The palettes' shades, light and dark, as in globals.css (for the swatches only). */
const PALETTES: Record<ButtonSettings["primary"], [light: string, dark: string]> = {
  teal: ["#127686", "#49d2ea"],
  ocean: ["#12719e", "#77c8f8"],
  lagoon: ["#127879", "#44d5d7"],
  jade: ["#137b60", "#61d7b2"],
  cobalt: ["#0d63d0", "#2981fb"],
};

/** The primary colour: one swatch per palette, its light shade over its dark one. */
function PalettePicker({
  value,
  onChange,
}: {
  value: ButtonSettings["primary"];
  onChange: (v: ButtonSettings["primary"]) => void;
}) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 font-medium">Primary colour</legend>
      <div className="flex flex-wrap gap-2">
        {BUTTON_OPTIONS.primary.map((p) => (
          <label
            key={p}
            className="studio-chip flex items-center gap-2"
            title={`${title(p)}: ${PALETTES[p][0]} light, ${PALETTES[p][1]} dark`}
          >
            <input type="radio" name={group} className="sr-only" checked={value === p} onChange={() => onChange(p)} />
            <span
              aria-hidden
              className="size-4 rounded-full ring-1 ring-ink/15"
              style={{ background: `linear-gradient(135deg, ${PALETTES[p][0]} 50%, ${PALETTES[p][1]} 50%)` }}
            />
            {title(p)}
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-xs leading-snug text-muted">
        Each has a light-mode and a dark-mode shade, both at WCAG AA or better with their text.
      </p>
    </fieldset>
  );
}

const mail = <HugeiconsIcon icon={Mail01Icon} size={17} strokeWidth={1.6} />;
const github = (
  <NavIcon
    library="hugeicons"
    id="github"
    style={{ size: 18, stroke: 1.5, phosphorWeight: "regular", filled: false }}
  />
);
const en = DICTIONARIES.en;
const ar = DICTIONARIES.ar;
const downloadLabels = (t: typeof en) => ({
  idle: t.actions.cv,
  loading: t.actions.downloading,
  done: t.actions.downloaded,
  error: t.actions.downloadFailed,
});
const emailLabels = (t: typeof en) => ({
  idle: t.actions.email,
  loading: t.actions.emailOpening,
  done: t.actions.emailCopied,
});
const sendLabels = (t: typeof en) => ({
  idle: t.actions.send,
  loading: t.actions.sending,
  done: t.actions.sent,
  error: t.actions.sendFailed,
});

/** The real buttons: feel the pull, and run each one's whole cycle: email, download, send. */
function Playground({ b, slow, fail }: { b: ButtonSettings; slow: boolean; fail: boolean }) {
  const row = (t: typeof en, dir: "ltr" | "rtl", lang: string) => (
    <div dir={dir} lang={lang} className="flex flex-wrap items-center gap-4">
      <EmailButton email={t.profile.email} labels={emailLabels(t)} settings={b} noMail />
      <DownloadButton
        href={t.profile.cv}
        filename="mostafa-osama-cv.pdf"
        labels={downloadLabels(t)}
        settings={b}
        simulate={slow || fail ? 1800 : undefined}
        fail={fail}
      />
      <SendButton labels={sendLabels(t)} settings={b} simulate={1600} fail={fail} />
    </div>
  );
  return (
    <div className="space-y-8 rounded-2xl border border-ink/10 px-8 py-10">
      {row(en, "ltr", "en")}
      {row(ar, "rtl", "ar")}
    </div>
  );
}

const FROZEN: { name: string; status: Status; progress: number | null }[] = [
  { name: "Ready", status: "idle", progress: null },
  { name: "Starting", status: "loading", progress: null },
  { name: "35%", status: "loading", progress: 0.35 },
  { name: "80%", status: "loading", progress: 0.8 },
  { name: "Done", status: "done", progress: 1 },
  { name: "Failed", status: "error", progress: null },
];

/** Every state, frozen. */
function States({ b }: { b: ButtonSettings }) {
  const cell = "flex min-h-14 items-center";
  const states = [undefined, "hover", "focus", "active"] as const;
  return (
    <div className="space-y-6 rounded-2xl border border-ink/10 p-6">
      <div className="grid grid-cols-[6rem_repeat(4,auto)] justify-start gap-x-6 text-sm">
        <span />
        {["Default", "Hover", "Focus", "Pressed"].map((n) => (
          <span key={n} className="pb-1 text-xs text-muted">
            {n}
          </span>
        ))}
        <Label>Main</Label>
        {states.map((st, i) => (
          <span key={i} className={cell}>
            <Button settings={b} state={st} icon={mail}>
              Email me
            </Button>
          </span>
        ))}
        <Label>Secondary</Label>
        {states.map((st, i) => (
          <span key={i} className={cell}>
            <Button
              settings={b}
              kind="secondary"
              state={st}
              icon={<HugeiconsIcon icon={Download04Icon} size={17} strokeWidth={1.6} />}
            >
              Download CV
            </Button>
          </span>
        ))}
        <Label>Link · icon</Label>
        <span className={cell}>
          <Button settings={b} kind="link" href="#">
            View project
          </Button>
        </span>
        <span className={cell}>
          <Button settings={b} kind="link" href="#" state="hover">
            View project
          </Button>
        </span>
        <span className={cell}>
          <Button settings={b} kind="icon" label="GitHub">
            {github}
          </Button>
        </span>
        <span className={cell}>
          <Button settings={b} kind="icon" label="GitHub" state="hover">
            {github}
          </Button>
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted">Download</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {FROZEN.map((f) => (
            <span key={f.name} className="flex flex-col gap-1.5">
              <StatusButton
                kind="secondary"
                status={f.status}
                progress={f.progress}
                labels={downloadLabels(en)}
                cycle="download"
                settings={b}
              />
              <span className="text-[11px] text-muted">{f.name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-muted">Email</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {(["idle", "loading", "done"] as const).map((st) => (
            <span key={st} className="flex flex-col gap-1.5">
              <StatusButton
                status={st}
                labels={{ ...emailLabels(en), error: en.actions.emailCopied }}
                cycle="email"
                settings={b}
              />
              <span className="text-[11px] text-muted">{{ idle: "Ready", loading: "Sealing", done: "Done" }[st]}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-muted">Send</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {FROZEN.filter((f) => f.progress === null || f.status === "done").map((f) => (
            <span key={f.name} className="flex flex-col gap-1.5">
              <StatusButton status={f.status} labels={sendLabels(en)} cycle="send" settings={b} />
              <span className="text-[11px] text-muted">{f.name === "Starting" ? "Sending" : f.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="flex min-h-14 items-center text-xs text-muted">{children}</span>;
}

export function ButtonStudio({ saved }: { saved: ButtonSettings }) {
  const [b, setB] = useState(saved);
  const [baseline, setBaseline] = useState(saved);
  const [slow, setSlow] = useState(true);
  const [fail, setFail] = useState(false);
  const [panel, setPanel] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const dirty = JSON.stringify(b) !== JSON.stringify(baseline);
  const prefs = usePreferences();

  // Preview the palette on the whole page (globals.css reads data-primary on <html>).
  useEffect(() => {
    document.documentElement.dataset.primary = b.primary;
  }, [b.primary]);

  const set = <K extends keyof ButtonSettings>(key: K, value: ButtonSettings[K]) => {
    setB((c) => ({ ...c, [key]: value }));
    setStatus(null);
  };
  const choice = <K extends keyof typeof BUTTON_OPTIONS>(key: K, label: string) => (
    <Choice
      label={label}
      options={BUTTON_OPTIONS[key] as readonly string[]}
      value={b[key] as string}
      onChange={(v) => {
        set(key, v as ButtonSettings[K]);
        // A new letting-go curve starts at its natural length; the Release slider fine-tunes it.
        if (key === "spring") set("releaseTime", SPRING_TIMES[v as ButtonSettings["spring"]]);
      }}
      hint={HINTS[key]?.[b[key] as string]}
    />
  );
  const slider = <K extends keyof typeof BUTTON_RANGES>(key: K, label: string, unit: string, note: string) => {
    const [min, max, step] = BUTTON_RANGES[key];
    return (
      <Slider
        label={label}
        unit={unit}
        min={min}
        max={max}
        step={step}
        value={b[key]}
        onChange={(v) => set(key, v as ButtonSettings[K])}
        note={note}
      />
    );
  };
  const save = async () => {
    setStatus("Saving…");
    const res = await fetch("/studio/buttons/save", { method: "POST", body: JSON.stringify(b) }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { error?: string } | null;
    if (res?.ok) {
      setBaseline(b);
      setStatus("Saved to src/components/ui/buttons.settings.json");
    } else setStatus(body?.error ?? "Couldn't save. Is `next dev` running?");
  };

  return (
    <div className={panel ? "lg:[--nav-offset-start:360px]" : ""}>
      <div className="pl-[var(--nav-offset-start,0px)]">
        <main className="mx-auto max-w-5xl space-y-12 px-6 py-14">
          <section className="space-y-3">
            <h1 className="text-xs font-semibold tracking-wide text-muted uppercase">
              Try them: move the cursor near a button, click Download or Send
            </h1>
            <Playground b={b} slow={slow} fail={fail} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">Every state</h2>
            <States b={b} />
          </section>
        </main>
      </div>

      {panel ? (
        <aside
          aria-label="Button studio controls"
          className="studio-panel fixed inset-y-0 left-0 z-50 flex w-[360px] max-w-full flex-col border-r border-ink/10 bg-paper text-sm"
        >
          <header className="space-y-2 border-b border-ink/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Buttons</h2>
              {dirty && <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs text-muted">unsaved</span>}
              <div className="ml-auto flex gap-1.5">
                <button type="button" className="studio-btn" disabled={!dirty} onClick={() => setB(baseline)}>
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
            <Choice
              label="Theme"
              options={["light", "dark", "system"]}
              value={prefs?.theme ?? "system"}
              onChange={(v) => setTheme(v as ThemePref)}
            />
            {status && (
              <p role="status" className="text-xs text-muted">
                {status}
              </p>
            )}
          </header>

          <div className="flex-1 space-y-7 overflow-y-auto px-4 pt-5 pb-10">
            <Section
              title="Magnetic"
              note="While the cursor is on a button, it follows, trailing a little, and springs back on leave. Off under reduced motion."
            >
              {slider(
                "strength",
                "Strength",
                "px",
                "How far the button follows the cursor, at its edge. 0 turns it off.",
              )}
              {slider("follow", "Label follow", "×", "How much further the label moves than the button: depth.")}
              {choice("spring", "Letting go: curve")}
              <Toggle label="Shadow while hovered" checked={b.shadow} onChange={(v) => set("shadow", v)} />
              <Toggle label="Dip when pressed" checked={b.press} onChange={(v) => set("press", v)} />
            </Section>

            <Section title="Speed" note="In seconds. Hover a button after each change to feel it.">
              {slider(
                "fillTime",
                "Fill",
                "s",
                "How long the colour takes to rise over the button. The text turns in half of it.",
              )}
              {slider(
                "followTime",
                "Follow",
                "s",
                "How long the button takes to catch up with the cursor: higher trails more.",
              )}
              {slider(
                "releaseTime",
                "Letting go",
                "s",
                "How long it takes to spring back. Picking a curve resets it to that curve's own length.",
              )}
            </Section>

            <Section title="Colour" note="Use the theme switch above to see both modes.">
              <PalettePicker value={b.primary} onChange={(v) => set("primary", v)} />
              {choice("accent", "Main button colour")}
              {choice("fill", "Fill on hover")}
            </Section>

            <Section title="Look">
              {choice("look", "Main button")}
              {choice("secondary", "Secondary button")}
              {choice("shape", "Corners")}
              {choice("size", "Size")}
              {choice("icons", "Icons")}
              {choice("link", "Text links")}
            </Section>

            <Section
              title="Download button"
              note="Ready → downloading → downloaded, then ready again. Real progress on the site."
            >
              {choice("progress", "Progress")}
              <Toggle label="Show the percentage" checked={b.percent} onChange={(v) => set("percent", v)} />
            </Section>

            <Section title="Send button" note="For the contact form: ready → sending → sent, or not sent.">
              {choice("sending", "While sending")}
            </Section>

            <Section title="Try it with" note="Studio only: the CV is local, so a real download is instant.">
              <Toggle label="A slow connection" checked={slow} onChange={setSlow} />
              <Toggle label="A failure (see the error state)" checked={fail} onChange={setFail} />
            </Section>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          className="studio-panel studio-btn fixed top-3 left-3 z-50 bg-paper"
          onClick={() => setPanel(true)}
        >
          Controls →
        </button>
      )}
    </div>
  );
}
