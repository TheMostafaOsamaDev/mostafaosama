import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import portrait from "@/assets/mostafa-osama.jpg";
import { DownloadButton, EmailButton } from "@/components/ui/StatusButtons";
import type { Dictionary } from "@/i18n/dictionaries";
import type { HomeSettings } from "./home";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * The portrait with the chosen tone, shape and edge (all CSS, see home.css). `data-hero-photo` is what the photo
 * entrance animates. The face sits in the upper third of the source, hence the object position.
 */
export function Portrait({
  settings,
  shape = settings.shape,
  edge = settings.edge,
  className = "",
  sizes,
  priority = true,
  alt,
  focus = "50% 24%",
}: {
  settings: HomeSettings;
  shape?: HomeSettings["shape"] | "pill";
  edge?: HomeSettings["edge"];
  className?: string;
  sizes: string;
  priority?: boolean;
  /** The portrait's description, or "" where the name is already in the text next to it. */
  alt: string;
  /** Where the crop centres (object-position); the default keeps the face in the upper third. */
  focus?: string;
}) {
  return (
    <div
      data-hero-photo
      data-shape={shape}
      data-tone={settings.tone}
      data-edge={edge}
      className={`hero-photo relative overflow-hidden ${className}`}
    >
      <Image
        src={portrait}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        className="object-cover"
        style={{ objectPosition: focus }}
      />
    </div>
  );
}

/** One line of the entrance: masked (for "reveal"), with its place in the stagger. */
export function Line({ i, children, className = "" }: { i: number; children: ReactNode; className?: string }) {
  return (
    <span className="hero-mask block">
      <span data-hero-line style={{ "--i": i } as Vars} className={`block ${className}`}>
        {children}
      </span>
    </span>
  );
}

/** The statement, split into words for the "words" entrance (each line also works as a plain line). */
export function Statement({ lines, start, className = "" }: { lines: string[]; start: number; className?: string }) {
  let w = 0;
  return (
    // Balanced wrapping: on phones the first line wraps into two even halves instead of leaving "load," alone.
    <p className={`text-balance ${className}`}>
      {lines.map((text, k) => (
        <span key={k} className="hero-mask block">
          <span data-hero-line data-has-words style={{ "--i": start + k } as Vars} className="block">
            {text.split(" ").map((word, j) => (
              <span key={j}>
                <span data-hero-word style={{ "--w": w++ } as Vars} className="inline-block">
                  {word}
                </span>{" "}
              </span>
            ))}
          </span>
        </span>
      ))}
    </p>
  );
}

/** Availability and location. */
export function Badge({ t, i = 0, className = "" }: { t: Dictionary; i?: number; className?: string }) {
  return (
    <p
      data-hero-fade
      style={{ "--i": i } as Vars}
      className={`inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-sm text-muted ${className}`}
    >
      <span aria-hidden className="hero-status size-2 rounded-full bg-emerald-500" />
      {t.profile.availability} · {t.profile.city}
    </p>
  );
}

const emailLabels = (t: Dictionary) => ({
  idle: t.actions.email,
  loading: t.actions.emailOpening,
  done: t.actions.emailCopied,
});

/** Email and CV, in the site's button style (buttons.settings.json); the CV button shows its download. */
export function Actions({ t, i = 1, className = "" }: { t: Dictionary; i?: number; className?: string }) {
  return (
    <div data-hero-fade style={{ "--i": i } as Vars} className={`flex flex-wrap gap-3 ${className}`}>
      {/* Opens the mail app and copies the address: the envelope seals, then "Address copied". */}
      <EmailButton email={t.profile.email} labels={emailLabels(t)} />
      {/* Shows its progress, then "Downloaded" (see StatusButtons). */}
      <DownloadButton
        href={t.profile.cv}
        filename="mostafa-osama-cv.pdf"
        labels={{
          idle: t.actions.cv,
          loading: t.actions.downloading,
          done: t.actions.downloaded,
          error: t.actions.downloadFailed,
        }}
      />
    </div>
  );
}
