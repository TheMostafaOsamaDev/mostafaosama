"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import type { TraceAxis, TraceRow } from "@/lib/trace";

gsap.registerPlugin(useGSAP);

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Next keeps visited routes mounted (React <Activity>) and re-runs effects when one comes back.
 * The draw-in is a first-impression moment, so it plays once per page load, not per visit.
 * The flag flips only when the timeline finishes: an effect torn down mid-draw (Strict Mode,
 * a quick navigation) gets to play it again.
 */
let hasPlayed = false;

export function Trace({ rows, axis }: { rows: TraceRow[]; axis: TraceAxis }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  useGSAP(
    () => {
      if (hasPlayed) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", root.current);
        const plain = bars.filter((b) => b.dataset.bar !== "critical");
        const critical = bars.filter((b) => b.dataset.bar === "critical");
        gsap
          .timeline({ onComplete: () => void (hasPlayed = true) })
          .from(plain, { scaleX: 0, duration: 0.42, ease: "power2.out", stagger: 0.07 })
          .from(critical, { scaleX: 0, duration: 0.55, ease: "power3.out" }, "-=0.12");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // A plain event handler: its tweens are short-lived, so they don't need useGSAP's cleanup context.
  function toggle(id: string) {
    const panel = root.current?.querySelector<HTMLElement>(`#entry-${id}`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open.has(id)) {
      const close = () =>
        setOpen((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      if (!panel || reduce) return close();
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.24,
        ease: "power2.in",
        onComplete: () => {
          close();
          // Once React has hidden the panel, drop the inline styles so a reopen starts clean.
          requestAnimationFrame(() => gsap.set(panel, { clearProps: "height,opacity" }));
        },
      });
      return;
    }
    setOpen((prev) => new Set(prev).add(id));
    if (reduce) return;
    // Wait for React to unhide the panel, then grow it from nothing to its natural height.
    requestAnimationFrame(() => {
      const el = root.current?.querySelector<HTMLElement>(`#entry-${id}`);
      if (el) gsap.fromTo(el, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.34, ease: "power2.out", clearProps: "height,opacity" });
    });
  }

  return (
    <div ref={root}>
      <ol className="grid gap-y-2.5 tabular-nums" aria-label="Work, as a trace">
        {rows.map((row) => (
          <Row key={row.id} row={row} isOpen={open.has(row.id)} onToggle={() => toggle(row.id)} />
        ))}
      </ol>
      <Axis axis={axis} />
    </div>
  );
}

function Row({ row, isOpen, onToggle }: { row: TraceRow; isOpen: boolean; onToggle: () => void }) {
  const tone = row.critical ? "text-crit font-semibold" : row.entry ? "text-ink" : "text-muted";
  const barTone = row.critical ? "bg-crit" : isOpen ? "bg-ink" : "bg-span";

  const label = row.entry ? (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`entry-${row.id}`}
      className={`group inline-flex max-w-full items-baseline gap-1.5 text-left ${tone}`}
    >
      <span className="truncate underline decoration-transparent underline-offset-3 transition-colors group-hover:decoration-current">
        {row.label}
      </span>
      <span aria-hidden className="text-muted">
        {isOpen ? "−" : "+"}
      </span>
    </button>
  ) : (
    <span className={`block truncate ${tone}`}>{row.label}</span>
  );

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[13rem_minmax(0,1fr)_3.5rem]">
      <div className={`min-w-0 text-small [font-stretch:85%] ${row.child ? "pl-4" : ""}`}>{label}</div>
      <div className="relative col-span-2 h-3 sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-hairline" />
        <span
          data-bar={row.critical ? "critical" : "plain"}
          className={`absolute top-0 h-3 origin-left rounded-[2px] transition-colors duration-150 ${barTone}`}
          style={{ left: `${row.left}%`, width: `${row.width}%` }}
        />
      </div>
      <div
        className={`col-start-2 row-start-1 text-right text-small sm:col-start-3 ${row.critical ? "text-crit" : "text-muted"}`}
        title={row.range}
      >
        <span className="sr-only">{row.range}, </span>
        {row.duration}
      </div>
      {row.entry ? (
        <div id={`entry-${row.id}`} hidden={!isOpen} className="col-span-full overflow-hidden">
          <Entry row={row} />
        </div>
      ) : null}
    </li>
  );
}

function Entry({ row }: { row: TraceRow }) {
  const p = row.entry!;
  return (
    <div className="max-w-[54rem] pt-2 pb-4 sm:pl-[14rem]">
      <p>{p.summary}</p>
      <dl className="mt-3 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-small">
        <dt className="text-muted">When</dt>
        <dd>{row.range}</dd>
        {p.built ? (
          <>
            <dt className="text-muted">Built</dt>
            <dd>
              <ul className="grid gap-1">
                {p.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
        {p.detail ? (
          <>
            <dt className="text-muted">Detail</dt>
            <dd>{p.detail}</dd>
          </>
        ) : null}
        {p.numbers ? (
          <>
            <dt className="text-muted">Numbers</dt>
            <dd>{p.numbers}</dd>
          </>
        ) : null}
        <dt className="text-muted">Stack</dt>
        <dd>{p.stack.join(", ")}</dd>
        <dt className="text-muted">{p.links.length > 1 ? "Links" : "Link"}</dt>
        <dd className="flex flex-wrap gap-x-4 gap-y-1">
          {p.links.map((l) => (
            <a key={l.href} href={l.href} className="link" target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </dd>
      </dl>
    </div>
  );
}

function Axis({ axis }: { axis: TraceAxis }) {
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-[13rem_minmax(0,1fr)_3.5rem] sm:gap-x-4" aria-hidden>
      <div className="relative h-5 text-small text-muted sm:col-start-2">
        {axis.ticks.map((t, i) => (
          <span
            key={t.label}
            className={`absolute top-0 before:absolute before:-top-1.5 before:h-1 before:border-l before:border-hairline ${
              i === 0 ? "before:left-0" : "-translate-x-1/2 before:left-1/2"
            } ${i % 2 ? "max-sm:hidden" : ""}`}
            style={{ left: `${t.at}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
