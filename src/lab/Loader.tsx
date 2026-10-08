"use client";

import { catchError, type ErrorInfo } from "next/error";
import dynamic from "next/dynamic";
import type { LabEntry } from "@/content/lab";

function Loading() {
  return <p className="text-small text-muted">Loading the simulation.</p>;
}

// Each experiment is its own chunk, fetched only on its page and never rendered on the server.
const experiments: Record<LabEntry["slug"], React.ComponentType> = {
  "retry-storm": dynamic(() => import("./retry-storm/Experiment"), { ssr: false, loading: Loading }),
  "exactly-once": dynamic(() => import("./exactly-once/Experiment"), { ssr: false, loading: Loading }),
  "two-limiters": dynamic(() => import("./two-limiters/Experiment"), { ssr: false, loading: Loading }),
};

function Crashed(_: object, { error, retry }: ErrorInfo) {
  return (
    <div className="grid max-w-[40rem] gap-3 border-l-2 border-err pl-4">
      <p>This experiment crashed. The rest of the site is fine, which is the point of keeping them apart.</p>
      <p className="text-small text-muted">{error instanceof Error ? error.message : String(error)}</p>
      <button type="button" onClick={() => retry()} className="link w-max text-small">
        Try again
      </button>
    </div>
  );
}

const Boundary = catchError(Crashed);

export function ExperimentLoader({ slug }: { slug: LabEntry["slug"] }) {
  const Experiment = experiments[slug];
  return (
    <Boundary>
      <Experiment />
    </Boundary>
  );
}
