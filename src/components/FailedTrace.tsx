"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// Durations are in milliseconds on a 0–4ms axis. They're a joke, not a measurement.
const SPANS = [
  { label: "router: match", left: 0, width: 50, ms: "2 ms", failed: false },
  { label: "router: not found", left: 50, width: 25, ms: "1 ms", failed: true },
];

/** The 404's one moment: the request draws like any other, and its last span fails. */
export function FailedTrace() {
  const path = usePathname();
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", root.current);
        const failedBars = gsap.utils.toArray<HTMLElement>("[data-bar][data-failed]", root.current);
        const failedText = gsap.utils.toArray<HTMLElement>("[data-failed]:not([data-bar])", root.current);
        // GSAP interpolates colors, not custom properties, so resolve the token first.
        const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
        gsap
          .timeline()
          .from(bars, { scaleX: 0, duration: 0.35, ease: "power2.out", stagger: 0.18 })
          // Failed spans start out looking healthy, then turn.
          .from(failedBars, { backgroundColor: ink, duration: 0.25 }, "+=0.1")
          .from(failedText, { color: ink, duration: 0.25 }, "<");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="grid gap-y-2.5 tabular-nums" aria-label="The request that failed">
      <Row label={`GET ${path}`} left={0} width={75} ms="404, 3 ms" failed strong />
      {SPANS.map((s) => (
        <Row key={s.label} {...s} child />
      ))}
    </ol>
  );
}

function Row({
  label,
  left,
  width,
  ms,
  failed,
  child = false,
  strong = false,
}: {
  label: string;
  left: number;
  width: number;
  ms: string;
  failed: boolean;
  child?: boolean;
  strong?: boolean;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[13rem_minmax(0,1fr)_5.5rem]">
      <span
        {...(failed ? { "data-failed": "" } : {})}
        className={`truncate text-small [font-stretch:85%] ${child ? "pl-4" : ""} ${failed ? "text-err" : "text-muted"} ${strong ? "font-semibold" : ""}`}
      >
        {label}
      </span>
      <span className="relative col-span-2 h-3 sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-hairline" />
        <span
          data-bar
          {...(failed ? { "data-failed": "" } : {})}
          className={`absolute top-0 h-3 origin-left rounded-[2px] ${failed ? "bg-err" : "bg-span"}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </span>
      <span
        className={`col-start-2 row-start-1 text-right text-small sm:col-start-3 ${failed ? "text-err" : "text-muted"}`}
      >
        {ms}
      </span>
    </li>
  );
}
