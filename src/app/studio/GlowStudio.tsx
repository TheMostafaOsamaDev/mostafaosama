"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { CornerGlowView } from "@/components/CornerGlow";
import { MAX_COLORS, PLACEMENT, SLIDERS, TOGGLES, type GlowSettings, type SliderSpec } from "@/components/glow";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const toJSON = (s: GlowSettings) => JSON.stringify(s, null, 2);

// Window size, for the reach readout.
const subscribeResize = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readSize = () => `${window.innerWidth}x${window.innerHeight}`;

/** Grey bars standing in for text, so the preview shows layout without real content. */
function Lines({ widths, color }: { widths: string[]; color: string }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {widths.map((w, i) => (
        <div key={i} className="h-3 rounded-sm" style={{ width: w, background: color }} />
      ))}
    </div>
  );
}

const SECTIONS = ["Work", "Projects", "Writing", "Lab", "Contact"];

/**
 * Development-only playground for the corner glow: React Bits' Background Studio controls for Grainient,
 * plus placement, a light/dark preview and sample content. "Save to site" writes glow.settings.json.
 */
export function GlowStudio({ saved }: { saved: GlowSettings }) {
  const system = useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light"),
    () => null,
  );
  const [settings, setSettings] = useState<GlowSettings>(saved);
  const [lightOverride, setLightOverride] = useState<boolean | null>(null);
  const [sample, setSample] = useState(true);
  const [replay, setReplay] = useState(0);
  const [status, setStatus] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const windowSize = useSyncExternalStore(subscribeResize, readSize, () => null);
  if (!system || !windowSize) return null;
  const [vw, vh] = windowSize.split("x").map(Number);
  const reachPx = Math.round(Math.min((settings.reach / 100) * Math.min(vw, vh), settings.maxReach));

  const light = lightOverride ?? system === "light";
  const scheme = light ? "light" : "dark";
  const paper = light ? "#ffffff" : settings.colors[0];
  const ink = light ? "#15171a" : "#e9ebee";
  const muted = light ? "#5f666d" : "#9aa1a8";
  const dirty = toJSON(settings) !== toJSON(saved);

  const set = <K extends keyof GlowSettings>(key: K, value: GlowSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setStatus(null);
  };
  const setColor = (i: number, value: string) =>
    set(
      "colors",
      settings.colors.map((c, j) => (j === i ? value : c)),
    );

  async function save() {
    setStatus(null);
    try {
      const res = await fetch("/studio/save", { method: "POST", body: toJSON(settings) });
      const body = (await res.json()) as { ok?: true; error?: string };
      setStatus(
        res.ok
          ? { tone: "ok", text: "Saved to glow.settings.json. The site uses these now." }
          : { tone: "err", text: body.error ?? `Save failed (${res.status}).` },
      );
    } catch {
      setStatus({ tone: "err", text: "Couldn't reach the dev server. Is `npm run dev` still running?" });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(toJSON(settings));
      setStatus({ tone: "ok", text: "Copied the settings as JSON." });
    } catch {
      setStatus({ tone: "err", text: "The browser blocked the clipboard. Use Save to site instead." });
    }
  }

  const bar = light ? "#eceef0" : "#1c2026";
  return (
    // A full, scrolling page like the real site: the glow behaves exactly as it will there.
    <div className="relative min-h-dvh" style={{ background: paper, color: ink }}>
      <CornerGlowView settings={settings} scheme={scheme} replay={replay} />

      {sample ? (
        <main className="relative z-10 mx-auto max-w-[40rem] px-4 pt-24 pb-40 sm:px-6 lg:ml-[max(22rem,calc(50%-20rem))]">
          <h1 className="text-xl font-semibold tracking-tight">Mostafa Osama</h1>
          <p className="mt-1" style={{ color: muted }}>
            Full stack developer
          </p>
          <div className="mt-10">
            <Lines widths={["100%", "96%", "88%", "60%"]} color={bar} />
          </div>
          {SECTIONS.map((title) => (
            <section key={title} className="mt-24">
              <h2 className="font-semibold">{title}</h2>
              <div className="mt-4">
                <Lines widths={["92%", "100%", "84%", "97%", "70%", "90%", "45%"]} color={bar} />
              </div>
              <div className="mt-8">
                <Lines widths={["100%", "88%", "94%", "52%"]} color={bar} />
              </div>
            </section>
          ))}
          <p className="mt-24 text-xs" style={{ color: muted }}>
            Sample layout, for judging the glow while scrolling. Not site content.
          </p>
        </main>
      ) : (
        <div className="h-[300dvh]" aria-hidden />
      )}

      <aside
        aria-label="Glow controls"
        className="fixed inset-y-3 left-3 z-20 flex w-80 flex-col overflow-hidden rounded-lg border text-sm shadow-lg"
        style={{
          background: light ? "rgb(255 255 255 / 0.92)" : "rgb(18 20 24 / 0.92)",
          borderColor: light ? "#e2e4e7" : "#262a30",
        }}
      >
        <header className="border-b px-4 py-3" style={{ borderColor: "inherit" }}>
          <p className="font-semibold">Glow studio</p>
          <p className="mt-0.5 text-xs" style={{ color: muted }}>
            Localhost only. Changes preview live; Save to site writes them for real.
          </p>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <Section title="Colors" muted={muted}>
            <ul className="space-y-2">
              {settings.colors.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`Color ${i + 1}`}
                    value={c}
                    onChange={(e) => setColor(i, e.target.value)}
                    className="h-7 w-9 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
                    style={{ borderColor: "inherit" }}
                  />
                  <HexInput value={c} onChange={(v) => setColor(i, v)} label={`Color ${i + 1} hex`} />
                  <button
                    type="button"
                    aria-label={`Remove color ${i + 1}`}
                    disabled={settings.colors.length <= 2}
                    onClick={() =>
                      set(
                        "colors",
                        settings.colors.filter((_, j) => j !== i),
                      )
                    }
                    className="ml-auto rounded px-2 py-1 disabled:opacity-30"
                    style={{ color: muted }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={settings.colors.length >= MAX_COLORS}
              onClick={() => set("colors", [...settings.colors, settings.colors[settings.colors.length - 1]])}
              className="mt-2 w-full rounded border py-1.5 disabled:opacity-40"
              style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}
            >
              Add color
            </button>
            <p className="mt-2 text-xs" style={{ color: muted }}>
              Keep the first two colors the same: the first is the dark page background, and repeating it is what stops
              the glow ending in a ring.
            </p>
          </Section>

          <Section title="Type" muted={muted}>
            <div
              className="grid grid-cols-2 gap-1 rounded border p-0.5"
              style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}
              role="radiogroup"
              aria-label="Type"
            >
              {(["linear", "radial"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={settings.type === t}
                  onClick={() => set("type", t)}
                  className="rounded py-1 capitalize"
                  style={settings.type === t ? { background: ink, color: paper } : { color: muted }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Effect" muted={muted}>
            <div className="space-y-3">
              {SLIDERS.map((s) => (
                <Slider key={s.key} spec={s} value={settings[s.key]} onChange={(v) => set(s.key, v)} muted={muted} />
              ))}
            </div>
          </Section>

          <Section title="Behaviour" muted={muted}>
            <div className="space-y-2">
              {TOGGLES.map((t) => (
                <Toggle key={t.key} label={t.label} checked={settings[t.key]} onChange={(v) => set(t.key, v)} />
              ))}
              <Toggle label="Light Mode" checked={light} onChange={(v) => setLightOverride(v)} />
            </div>
            <p className="mt-2 text-xs" style={{ color: muted }}>
              Light Mode previews the light theme. On the site it follows the visitor&apos;s system setting.
            </p>
          </Section>

          <Section title="Placement" muted={muted}>
            <div className="space-y-3">
              {PLACEMENT.map((s) => (
                <Slider key={s.key} spec={s} value={settings[s.key]} onChange={(v) => set(s.key, v)} muted={muted} />
              ))}
            </div>
            <p className="mt-2 text-xs tabular-nums" style={{ color: muted }}>
              On this window ({vw}×{vh}) it reaches {reachPx}px from the corner: {Math.round((reachPx / vw) * 100)}% of
              the width and {Math.round((reachPx / vh) * 100)}% of the height.
            </p>
            <div
              className="mt-3 grid grid-cols-2 gap-1 rounded border p-0.5"
              style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}
              role="radiogroup"
              aria-label="While scrolling"
            >
              {(
                [
                  ["fixed", "Stays in corner"],
                  ["page", "Scrolls away"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={settings.attach === value}
                  onClick={() => set("attach", value)}
                  className="rounded py-1"
                  style={settings.attach === value ? { background: ink, color: paper } : { color: muted }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Preview" muted={muted}>
            <div className="space-y-2">
              <Toggle label="Sample page" checked={sample} onChange={setSample} />
              <button type="button" onClick={() => setReplay((r) => r + 1)} className="underline underline-offset-2">
                Replay intro
              </button>
            </div>
          </Section>
        </div>

        <footer className="space-y-2 border-t px-4 py-3" style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}>
          {status ? (
            <p role="status" className="text-xs" style={{ color: status.tone === "ok" ? muted : "#d14343" }}>
              {status.text}
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!dirty}
              onClick={() => {
                setSettings(saved);
                setStatus({ tone: "ok", text: "Back to the saved settings." });
              }}
              className="rounded border py-1.5 disabled:opacity-40"
              style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={copy}
              className="rounded border py-1.5"
              style={{ borderColor: light ? "#e2e4e7" : "#262a30" }}
            >
              Copy
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={save}
              className="rounded py-1.5 font-medium disabled:opacity-40"
              style={{ background: ink, color: paper }}
            >
              Save to site
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Section({ title, muted, children }: { title: string; muted: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium" style={{ color: muted }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Slider({
  spec,
  value,
  onChange,
  muted,
}: {
  spec: SliderSpec;
  value: number;
  onChange: (v: number) => void;
  muted: string;
}) {
  const id = useId();
  const decimals = spec.step < 1 ? 2 : 0;
  return (
    <div>
      <label htmlFor={id} className="flex justify-between">
        <span>{spec.label}</span>
        <span className="tabular-nums" style={{ color: muted }}>
          {value.toFixed(decimals)}
          {spec.unit ? ` ${spec.unit}` : ""}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-current"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-current"
      />
    </label>
  );
}

function HexInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="text"
      aria-label={label}
      value={draft ?? value}
      spellCheck={false}
      onChange={(e) => {
        const v = e.target.value.trim();
        setDraft(v);
        if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
      }}
      onBlur={() => setDraft(null)}
      className="w-24 rounded border bg-transparent px-2 py-1 font-mono text-xs"
      style={{ borderColor: "inherit" }}
    />
  );
}
