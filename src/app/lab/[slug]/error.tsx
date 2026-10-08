"use client";

import Link from "next/link";

/** Second line of defence: if an experiment page fails outside its own boundary, only this segment goes down. */
export default function LabError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mt-12 grid gap-3 border-l-2 border-err pl-4">
      <p>This experiment page failed to load. Everything else still works.</p>
      <p className="text-small text-muted">{error.digest ? `Reference ${error.digest}` : error.message}</p>
      <div className="flex gap-4 text-small">
        <button type="button" onClick={() => retry()} className="link">
          Try again
        </button>
        <Link href="/lab" className="link">
          Back to the lab
        </Link>
      </div>
    </div>
  );
}
