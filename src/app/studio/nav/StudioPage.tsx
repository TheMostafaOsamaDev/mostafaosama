import { PageTransition } from "@/components/site-nav/PageTransition";
import { NAV_ITEMS } from "@/components/nav";

type StudioPageId = "home" | "work" | "experience" | "lab" | "writing" | "about" | "contact";

const Bar = ({ className = "" }: { className?: string }) => <div className={`rounded-md bg-ink/7 ${className}`} />;
const Lines = ({ n, last = "w-2/3" }: { n: number; last?: string }) => (
  <div className="space-y-2.5">
    {Array.from({ length: n }, (_, i) => (
      <Bar key={i} className={`h-3 ${i === n - 1 ? last : "w-full"}`} />
    ))}
  </div>
);

/** Placeholder layouts, different per page so a transition between them is easy to see. Not content. */
const BODIES: Partial<Record<StudioPageId, React.ReactNode>> = {
  home: (
    <>
      <Lines n={3} />
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Bar className="h-56" />
        <Bar className="h-56" />
      </div>
      <div className="mt-12 space-y-10">
        {Array.from({ length: 5 }, (_, i) => (
          <Lines key={i} n={4} last="w-1/2" />
        ))}
      </div>
    </>
  ),
  work: (
    <ul className="divide-y divide-ink/8">
      {Array.from({ length: 9 }, (_, i) => (
        <li key={i} className="flex items-center gap-4 py-6">
          <Bar className="size-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-1/3" />
            <Bar className="h-3 w-2/3" />
          </div>
          <Bar className="h-3 w-12" />
        </li>
      ))}
    </ul>
  ),
  experience: (
    <ol className="space-y-10 border-l border-ink/10 pl-6">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="relative space-y-2.5">
          <span className="absolute top-1 -left-[29px] size-2.5 rounded-full bg-ink/15" />
          <Bar className="h-3 w-24" />
          <Bar className="h-5 w-1/2" />
          <Lines n={3} />
        </li>
      ))}
    </ol>
  ),
  lab: (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Bar className="h-40" />
          <Bar className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  ),
  writing: (
    <ul className="space-y-10">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="space-y-2.5">
          <Bar className="h-3 w-20" />
          <Bar className="h-5 w-3/4" />
          <Lines n={2} />
        </li>
      ))}
    </ul>
  ),
  about: (
    <div className="grid gap-10 sm:grid-cols-[1fr_12rem]">
      <div className="space-y-10">
        {Array.from({ length: 6 }, (_, i) => (
          <Lines key={i} n={5} />
        ))}
      </div>
      <Bar className="aspect-square" />
    </div>
  ),
};

BODIES.contact = (
  <div className="space-y-6">
    <Lines n={2} />
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Bar key={i} className="h-28" />
      ))}
    </div>
    <div className="space-y-3 pt-6">
      <Bar className="h-11" />
      <Bar className="h-11" />
      <Bar className="h-36" />
      <Bar className="h-11 w-32" />
    </div>
    <div className="h-[60vh]" />
  </div>
);

export function StudioPage({ id }: { id: StudioPageId }) {
  const title = NAV_ITEMS.find((i) => i.id === id)?.label;
  return (
    <PageTransition>
      <main data-page className="mx-auto max-w-3xl px-6 pt-24 pb-48">
        <p className="text-xs text-muted">Sample page · skeleton only</p>
        <h1 className="mt-2 mb-10 text-4xl font-semibold tracking-tight">{title}</h1>
        {BODIES[id]}
      </main>
    </PageTransition>
  );
}
