"use client";

import { useState } from "react";
import { HomePage } from "@/components/home/HomePage";
import { HOME_OPTIONS, type HomeSettings } from "@/components/home/home";
import type { NavConfig } from "@/components/nav";
import { FloatingNav, useIsDesktop } from "@/components/site-nav/FloatingNav";
import { Choice, Section, Toggle } from "../controls";
import "../nav/studio.css";

const SAVE = "/studio/home/save";

/** Each hero idea, and the one interaction that belongs to it. */
const IDEAS: Record<HomeSettings["variant"], { name: string; note: string }> = {
  split: {
    name: "Split",
    note: "Name and statement left, portrait right. The portrait drifts up and fades as you scroll.",
  },
  glow: {
    name: "From the glow",
    note: "The portrait grows out of the corner glow. It shifts gently with the pointer.",
  },
  inline: { name: "Inline", note: "Statement first, the photo set inside the sentence. The photo widens on hover." },
  card: { name: "ID card", note: "Statement left, a card right. The card tilts toward the pointer with a sheen." },
  centered: { name: "Centred", note: "Calm, around a round portrait. A ring draws itself around the photo once." },
  editorial: {
    name: "Editorial",
    note: "Your name huge, the portrait between its lines. The names part as you scroll.",
  },
};

const HINTS: Record<string, Record<string, string>> = {
  tone: {
    natural: "The photo as taken.",
    cool: "Slightly cooler and calmer; matches the teal glow and quiets the park.",
    duotone: "Teal duotone: the background turns into texture.",
    mono: "Black and white.",
  },
  shape: {
    rounded: "Rounded rectangle.",
    arch: "Rounded top, like an arch window.",
    circle: "Circle (the Centred idea always uses one).",
    square: "Square corners.",
  },
  edge: { hard: "Clean edge.", fade: "The edges dissolve into the page, hiding the busy corners." },
  textIn: {
    reveal: "Lines slide up from behind a mask.",
    rise: "Lines fade in while rising.",
    blur: "Lines come into focus.",
    words: "The statement arrives word by word.",
    none: "Text is there from the first frame.",
  },
  photoIn: {
    clip: "The photo is uncovered from the bottom up.",
    fade: "The photo fades in.",
    scale: "The photo settles from slightly closer.",
    focus: "The photo comes into focus.",
    none: "The photo is there from the first frame.",
  },
  pace: { calm: "Unhurried.", brisk: "About a third faster." },
  navReveal: {
    hero: "The nav changes when you leave the introduction, and back when you return.",
    start: "The nav changes as soon as the page starts scrolling.",
  },
};

export function HomeStudio({ saved, nav }: { saved: HomeSettings; nav: NavConfig }) {
  const [s, setS] = useState(saved);
  const [baseline, setBaseline] = useState(saved);
  const [replay, setReplay] = useState(0);
  const [panel, setPanel] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const wide = useIsDesktop(1024);
  const dirty = JSON.stringify(s) !== JSON.stringify(baseline);

  const set = <K extends keyof HomeSettings>(key: K, value: HomeSettings[K]) => {
    setS((c) => ({ ...c, [key]: value }));
    setStatus(null);
    // Changing how things arrive is easiest to judge by seeing it arrive.
    if (key !== "navReveal") setReplay((r) => r + 1);
  };
  const choice = <K extends keyof typeof HOME_OPTIONS>(key: K, label: string) => (
    <Choice
      label={label}
      options={HOME_OPTIONS[key] as readonly string[]}
      value={s[key] as string}
      onChange={(v) => set(key, v as HomeSettings[K])}
      hint={HINTS[key]?.[s[key] as string]}
    />
  );
  const save = async () => {
    setStatus("Saving…");
    const res = await fetch(SAVE, { method: "POST", body: JSON.stringify(s) }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { error?: string } | null;
    if (res?.ok) {
      setBaseline(s);
      setStatus("Saved to src/components/home/home.settings.json");
    } else setStatus(body?.error ?? "Couldn't save. Is `next dev` running?");
  };

  return (
    <div className={panel ? "lg:[--nav-offset-start:360px]" : ""}>
      <div className="pl-[var(--nav-offset-start,0px)]">
        {/* Keyed, so every change replays the entrance from the start. */}
        <HomePage key={replay} settings={s} />
      </div>

      <FloatingNav
        config={nav}
        base="/studio/home"
        replay={0}
        sections
        revealAfter={s.navReveal}
        insetStart={panel && wide ? 360 : 0}
      />

      {panel ? (
        <aside
          aria-label="Home studio controls"
          className="studio-panel fixed inset-y-0 left-0 z-50 flex w-[360px] max-w-full flex-col border-r border-ink/10 bg-paper/95 text-sm backdrop-blur-md"
          style={{ viewTransitionName: "studio-panel" }}
        >
          <header className="space-y-2 border-b border-ink/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Home studio</h2>
              {dirty && <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs text-muted">unsaved</span>}
              <div className="ml-auto flex gap-1.5">
                <button type="button" className="studio-btn" disabled={!dirty} onClick={() => setS(baseline)}>
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
            {status && (
              <p role="status" className="text-xs text-muted">
                {status}
              </p>
            )}
          </header>

          <div className="flex-1 space-y-7 overflow-y-auto px-4 pt-5 pb-10">
            <Section title="Idea" note="Six different introductions. Each has one signature interaction; try it.">
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="sr-only">Hero idea</legend>
                {HOME_OPTIONS.variant.map((v) => (
                  <label
                    key={v}
                    className="cursor-pointer rounded-lg border border-ink/10 p-2.5 transition-colors hover:border-ink/30 has-checked:border-ink has-checked:bg-ink/4 has-focus-visible:outline-2"
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      checked={s.variant === v}
                      onChange={() => set("variant", v)}
                    />
                    <span className="block font-medium">{IDEAS[v].name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{IDEAS[v].note}</span>
                  </label>
                ))}
              </fieldset>
            </Section>

            <Section title="Photo" note="Treatments that calm the park background without editing the photo.">
              {choice("tone", "Tone")}
              {choice("shape", "Shape")}
              {choice("edge", "Edge")}
            </Section>

            <Section title="Entrance" note="Plain CSS: it starts with the first paint, so it costs nothing in speed.">
              {choice("textIn", "Text")}
              {choice("photoIn", "Photo")}
              {choice("pace", "Pace")}
              <button type="button" className="studio-btn" onClick={() => setReplay((r) => r + 1)}>
                Replay entrance
              </button>
            </Section>

            <Section title="Details">
              <Toggle label="Availability badge" checked={s.badge} onChange={(v) => set("badge", v)} />
              <Toggle label="Email and CV buttons" checked={s.ctas} onChange={(v) => set("ctas", v)} />
              <Toggle label="Signature interaction" checked={s.signature} onChange={(v) => set("signature", v)} />
            </Section>

            <Section
              title="Navigation"
              note="Bare over the introduction (no background or border); its surface fades in past it. It follows the section you're reading."
            >
              {choice("navReveal", "Nav changes")}
              <p className="text-xs leading-relaxed text-muted">
                Scroll the page to see it slide in, and use it to jump between sections. Light and dark: the theme
                toggle in the nav.
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
