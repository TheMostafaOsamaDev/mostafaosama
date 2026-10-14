import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { HomeSettings } from "./home";
import { ParallaxSection, Tilt } from "./Interactive";
import { Actions, Badge, Line, Portrait, Statement } from "./parts";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** What every hero's <section> carries: its id for the nav, and the entrance settings home.css reads. */
function sectionProps(s: HomeSettings, t: Dictionary) {
  return {
    id: "home",
    "data-section": "",
    "data-hero": s.variant,
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

/** Name and statement left, portrait right. Signature: the portrait drifts up and fades as the page scrolls. */
function Split({ s, t }: { s: HomeSettings; t: Dictionary }) {
  return (
    <section {...sectionProps(s, t)} className="relative">
      <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-[1.15fr_0.85fr] md:gap-16">
        <div className="order-2 md:order-1">
          <Line i={0} className="text-sm font-medium text-muted">
            {t.profile.kicker}
          </Line>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-7xl">
            <Line i={1}>{t.profile.name}</Line>
          </h1>
          <Statement
            lines={t.profile.statement}
            start={2}
            className="mt-6 text-xl leading-snug text-muted md:text-2xl"
          />
          <Extras s={s} t={t} className="mt-9" />
        </div>
        <div className="hero-drift order-1 md:order-2">
          <Portrait
            alt={t.profile.portraitAlt}
            settings={s}
            className="mx-auto aspect-[4/5] w-[min(68vw,20rem)] md:w-full"
            sizes="(min-width: 768px) 40vw, 68vw"
          />
        </div>
      </div>
    </section>
  );
}

/** The portrait grows out of the corner glow and fades into the page. Signature: it shifts with the pointer. */
function Glow({ s, t }: { s: HomeSettings; t: Dictionary }) {
  return (
    <ParallaxSection {...sectionProps(s, t)} enabled={s.signature} className="relative overflow-hidden">
      <div data-parallax="14" className="absolute top-0 end-0 h-[62svh] w-full md:h-[94svh] md:w-[min(46vw,40rem)]">
        <Portrait
          alt={t.profile.portraitAlt}
          settings={s}
          edge="glow"
          shape="square"
          className="size-full"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div
        data-parallax="4"
        className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-6 pt-[52svh] pb-20 md:pt-24"
      >
        <div className="md:max-w-[50%]">
          <Line i={0} className="text-sm font-medium text-muted">
            {t.profile.kicker}
          </Line>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-7xl">
            <Line i={1}>{t.profile.name}</Line>
          </h1>
          <Statement
            lines={t.profile.statement}
            start={2}
            className="mt-6 text-xl leading-snug text-muted md:text-2xl"
          />
          <Extras s={s} t={t} className="mt-9" />
        </div>
      </div>
    </ParallaxSection>
  );
}

/** Statement first, with the photo set inside the sentence. Signature: the photo pill widens on hover. */
function Inline({ s, t }: { s: HomeSettings; t: Dictionary }) {
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

/** Statement left, an ID card right. Signature: the card tilts toward the pointer with a light sheen. */
function Card({ s, t }: { s: HomeSettings; t: Dictionary }) {
  const row = "flex justify-between gap-4 border-t border-ink/8 py-2.5 text-sm";
  return (
    <section {...sectionProps(s, t)} className="relative">
      <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16">
        <div>
          <Line i={0} className="text-sm font-medium text-muted">
            {t.profile.kicker}
          </Line>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">
            <Line i={1}>{t.profile.name}</Line>
          </h1>
          <Statement
            lines={t.profile.statement}
            start={2}
            className="mt-6 text-xl leading-snug text-muted md:text-2xl"
          />
          <Extras s={s} t={t} className="mt-9" />
        </div>
        <div data-hero-fade style={{ "--i": 0 } as Vars} className="mx-auto w-full max-w-sm">
          <Tilt
            enabled={s.signature}
            className="rounded-3xl border border-ink/10 bg-paper/70 p-3 shadow-xl backdrop-blur-md"
          >
            <Portrait
              alt={t.profile.portraitAlt}
              settings={s}
              className="aspect-[4/5] w-full"
              sizes="(min-width: 768px) 24rem, 90vw"
            />
            <div className="px-2 pt-4 pb-1">
              <p className="font-semibold">{t.profile.name}</p>
              <p className="mb-3 text-sm text-muted">{t.profile.role}</p>
              <p className={row}>
                <span className="text-muted">{t.card.at}</span> {t.profile.company}, {t.card.since} {t.profile.since}
              </p>
              <p className={row}>
                <span className="text-muted">{t.card.basedIn}</span> {t.profile.location}
              </p>
              <p className={row}>
                <span className="text-muted">{t.card.status}</span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="hero-status size-2 rounded-full bg-emerald-500" /> {t.card.open}
                </span>
              </p>
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
}

/** Calm and centred on a round portrait. Signature: a ring draws itself around the photo, once. */
function Centered({ s, t }: { s: HomeSettings; t: Dictionary }) {
  return (
    <section {...sectionProps(s, t)} className="relative">
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="hero-ring rounded-full p-1.5">
          <Portrait
            alt={t.profile.portraitAlt}
            settings={s}
            shape="circle"
            className="size-32 md:size-40"
            sizes="10rem"
          />
        </div>
        <Line i={0} className="mt-8 text-sm font-medium text-muted">
          {t.profile.kicker}
        </Line>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">
          <Line i={1}>{t.profile.name}</Line>
        </h1>
        <Statement lines={t.profile.statement} start={2} className="mt-6 text-xl leading-snug text-muted md:text-2xl" />
        <Extras s={s} t={t} className="mt-9 items-center" />
      </div>
    </section>
  );
}

/**
 * Magazine-style: the first name, a wide strip of the portrait across the page, then the surname. Signature: as
 * the page scrolls the names part and the photo pans gently inside its frame.
 */
function Editorial({ s, t }: { s: HomeSettings; t: Dictionary }) {
  return (
    <section {...sectionProps(s, t)} className="relative overflow-hidden">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-6 py-24">
        <Line i={0} className="text-sm font-medium text-muted">
          {t.profile.kicker}
        </Line>
        <h1 className="mt-5 text-[clamp(3.4rem,14vw,11.5rem)] leading-[0.84] font-semibold tracking-[-0.045em] uppercase">
          <span className="hero-part-left block">
            <Line i={1}>{t.profile.first}</Line>
          </span>
          {/* The name is the text; the strip is decoration between its two lines: a head-and-shoulders crop (2:1
              shows about 40% of the photo's height), centred. A full-width strip needs a wider photo than the
              portrait (filling it would zoom in until only the eyes fit). The strip is its own frame, so the Edge
              setting doesn't apply here. */}
          <span className="hero-strip mx-auto my-[0.1em] block aspect-[2/1] h-[clamp(9rem,24vw,18rem)] max-w-full overflow-hidden rounded-3xl">
            <Portrait
              settings={s}
              shape="square"
              edge="hard"
              alt=""
              focus="50% 18%"
              className="size-full"
              sizes="(min-width: 768px) 36rem, 90vw"
            />
          </span>
          <span className="hero-part-right block text-end">
            <Line i={2}>{t.profile.last}</Line>
          </span>
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:items-end">
          <Statement lines={t.profile.statement} start={3} className="text-xl leading-snug text-muted md:text-2xl" />
          <Extras s={s} t={t} className="md:items-end" />
        </div>
      </div>
    </section>
  );
}

export const HEROES: Record<HomeSettings["variant"], (p: { s: HomeSettings; t: Dictionary }) => ReactNode> = {
  split: Split,
  glow: Glow,
  inline: Inline,
  card: Card,
  centered: Centered,
  editorial: Editorial,
};
