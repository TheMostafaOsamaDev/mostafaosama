import type { Locale } from "@/i18n/config";
import { DICTIONARIES, type Dictionary } from "@/i18n/dictionaries";
import type { HomeSettings } from "./home";
import { HEROES } from "./heroes";
import "./home.css";

const Bar = ({ className = "" }: { className?: string }) => <div className={`rounded-md bg-ink/6 ${className}`} />;

/** Placeholder until the section's content is written; tall enough to scroll through and watch the nav follow. */
function Placeholder({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <section id={id} data-section aria-labelledby={`${id}-title`} className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">{note}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Bar className="h-48" />
        <Bar className="h-48" />
        <Bar className="h-24 sm:col-span-2" />
      </div>
      <div className="mt-10 space-y-3">
        <Bar className="h-3" />
        <Bar className="h-3" />
        <Bar className="h-3 w-2/3" />
      </div>
    </section>
  );
}

/** The single-page site: the hero, then the sections the nav jumps between. */
export function HomePage({ settings, locale = "en" }: { settings: HomeSettings; locale?: Locale }) {
  const Hero = HEROES[settings.variant];
  const t: Dictionary = DICTIONARIES[locale];
  const sections = ["about", "work", "contact"] as const;
  return (
    <main data-page>
      <Hero s={settings} t={t} />
      {sections.map((id) => (
        <Placeholder key={id} id={id} title={t.sections[id]} note={t.sections.placeholder} />
      ))}
      <div className="h-[30svh]" />
    </main>
  );
}
