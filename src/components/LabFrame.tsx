import type { ReactNode } from "react";

/**
 * The one piece of site chrome an experiment may use: controls on top, the figure, then a
 * plain-language readout of what the figure shows. Experiments import nothing else from the site.
 */
export function LabFrame({
  controls,
  figure,
  readout,
}: {
  controls: ReactNode;
  figure: ReactNode;
  readout: ReactNode;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">{controls}</div>
      <figure className="min-w-0">{figure}</figure>
      <div aria-live="polite" className="max-w-[40rem]">
        {readout}
      </div>
    </div>
  );
}
