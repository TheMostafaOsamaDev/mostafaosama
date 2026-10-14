import type { Dictionary } from "@/i18n/dictionaries";
import type { HomeSettings } from "./home";
import { Actions, Badge, Line, Portrait, Statement } from "./parts";

/** What the hero's <section> carries: its id for the nav, and the entrance settings home.css reads. */
function sectionProps(s: HomeSettings, t: Dictionary) {
  return {
    id: "home",
    "data-section": "",
    "data-hero": "",
    "data-text-in": s.textIn,
    "data-photo-in": s.photoIn,
    "data-pace": s.pace,
    "data-signature": s.signature ? "" : undefined,
    "aria-label": t.sections.intro,
  };
}

function Extras({
  s,
  t,
  start = 0,
  className = "",
}: {
  s: HomeSettings;
  t: Dictionary;
  start?: number;
  className?: string;
}) {
  if (!s.badge && !s.ctas) return null;
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {s.badge && <Badge t={t} i={start} className="self-start [.text-center_&]:self-center" />}
      {s.ctas && <Actions t={t} i={start + 1} className="[.text-center_&]:justify-center" />}
    </div>
  );
}

/**
 * The hero ("inline", the owner's pick): the statement first, with the portrait set inside the sentence as a pill
 * that widens on hover (the signature).
 */
export function Hero({ s, t }: { s: HomeSettings; t: Dictionary }) {
  return (
    <section {...sectionProps(s, t)} className="relative">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 py-24">
        <Line i={0} className="text-sm font-medium text-muted">
          {t.profile.kicker}
        </Line>
        <h1 className="mt-4 text-[clamp(2.6rem,7.5vw,6rem)] leading-[1.04] font-semibold tracking-tight">
          <Line i={1}>
            {t.profile.greeting}{" "}
            <span className="hero-pill">
              <Portrait settings={s} shape="pill" edge="hard" className="size-full" sizes="12rem" alt="" />
            </span>{" "}
            {t.profile.name}.
          </Line>
        </h1>
        <Statement
          lines={t.profile.statement}
          start={2}
          className="mt-6 text-[clamp(1.4rem,3.2vw,2.4rem)] leading-tight text-muted"
        />
        <Extras s={s} t={t} className="mt-10" />
      </div>
    </section>
  );
}
