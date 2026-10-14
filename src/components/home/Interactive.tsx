"use client";

import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { usePreferences } from "@/components/preferences";

/**
 * The card leans toward the pointer, with a soft sheen where the light would hit (CSS reads --rx, --ry, --mx,
 * --my; see .hero-tilt in home.css). Mouse only; off under reduced motion.
 */
export function Tilt({
  children,
  className = "",
  enabled,
}: {
  children: ReactNode;
  className?: string;
  enabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePreferences()?.reduced ?? true;
  const on = enabled && !reduced;
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!on || !el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.dataset.tilting = "";
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilting;
  };
  return (
    <div ref={ref} className={`hero-tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}

/**
 * A section whose [data-parallax] children shift a few pixels against the pointer (the attribute's value is the
 * largest shift in px): depth without movement of its own. Mouse only; off under reduced motion.
 */
export function ParallaxSection({
  children,
  enabled,
  ...rest
}: HTMLAttributes<HTMLElement> & { enabled: boolean } & Record<`data-${string}`, string | undefined>) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePreferences()?.reduced ?? true;
  const move = (e: PointerEvent<HTMLElement>) => {
    if (!enabled || reduced || e.pointerType !== "mouse" || !ref.current) return;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    ref.current.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const d = Number(el.dataset.parallax);
      el.style.translate = `${-x * d}px ${-y * d}px`;
    });
  };
  return (
    <section ref={ref} onPointerMove={move} {...rest}>
      {children}
    </section>
  );
}
