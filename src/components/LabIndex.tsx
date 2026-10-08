"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

export type LabIndexItem = { slug: string; title: string; summary: string; year: number; preview: ReactNode };

/**
 * The lab's one signature: hovering or focusing an experiment brings its preview up in the margin
 * and quiets the others. On narrower screens (no reliable hover) each preview sits inline instead.
 */
export function LabIndex({ items }: { items: LabIndexItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const panes = gsap.utils.toArray<HTMLElement>("[data-pane]", root.current);
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          panes.forEach((p) => {
            const on = p.dataset.pane === active;
            if (ctx.conditions?.still) gsap.set(p, { autoAlpha: on ? 1 : 0, y: 0 });
            else gsap.to(p, { autoAlpha: on ? 1 : 0, y: on ? 0 : 6, duration: on ? 0.28 : 0.16, ease: "power2.out" });
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <div ref={root} className="relative" onMouseLeave={() => setActive(null)}>
      <ol className="grid gap-10">
        {items.map((item) => {
          const quiet = active !== null && active !== item.slug;
          return (
            <li key={item.slug}>
              <Link
                href={`/lab/${item.slug}`}
                prefetch
                onMouseEnter={() => setActive(item.slug)}
                onFocus={() => setActive(item.slug)}
                onBlur={() => setActive(null)}
                className="group block"
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span
                    className={`text-title font-semibold tracking-[-0.015em] text-balance transition-colors duration-150 ${
                      quiet ? "text-muted" : "text-ink"
                    } underline decoration-transparent decoration-1 underline-offset-4 group-hover:decoration-crit`}
                  >
                    {item.title}
                  </span>
                  <span className="text-small text-muted tabular-nums">{item.year}</span>
                </span>
                <span className="mt-2 block text-muted">{item.summary}</span>
              </Link>
              <div className="mt-4 xl:hidden" aria-hidden>
                {item.preview}
              </div>
            </li>
          );
        })}
      </ol>
      <aside aria-hidden className="absolute top-0 left-full ml-12 hidden w-[19rem] xl:block">
        <div className="sticky top-16 grid">
          {items.map((item) => (
            <div key={item.slug} data-pane={item.slug} className="invisible col-start-1 row-start-1 opacity-0">
              {item.preview}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
