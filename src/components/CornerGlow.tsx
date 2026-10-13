"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// WebGL only exists in the browser, and the glow is decoration: load it after the page, never on the server.
const Grainient = dynamic(() => import("./Grainient"), { ssr: false });

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Each palette starts with the page background, twice: a radial Grainient is still mid-ramp at the edge
 * of its canvas, so the extra stop makes the colour reach the background before the edge and the glow
 * dissolves into the page instead of leaving a ring. Low saturation and a slow drift keep it in the
 * corner of the eye.
 */
const PALETTES = {
  dark: ["#0b0c0f", "#0b0c0f", "#0e161d", "#16303f", "#2a5568", "#7fa7b4"],
  light: ["#f5f5f2", "#f5f5f2", "#e9eeed", "#c9dadd", "#9dbcc4", "#6f97a3"],
} as const;

export function CornerGlow() {
  const scheme = useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light"),
    () => null,
  );
  if (!scheme) return null;

  return (
    <div
      aria-hidden
      // A square centred on the top-right corner: only its inner quarter is on screen. The mask fades the
      // grain out with the colour, so no edge of the canvas is ever visible.
      className="pointer-events-none fixed top-0 right-0 z-0 aspect-square w-[min(72vmin,760px)] translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000_30%,rgb(0_0_0/0.55)_60%,transparent_92%)]"
    >
      <Grainient
        key={scheme}
        colors={[...PALETTES[scheme]]}
        type="radial"
        bands={1}
        softness={1}
        flow={0.6}
        scale={1}
        speed={0.35}
        silk={0.2}
        grainAmount={0.05}
        grainSize={1.2}
        grainAnimated={false}
        contrast={1}
        saturation={1}
        interactive={false}
        clickSwirl={false}
        intro
        dpr={1}
      />
    </div>
  );
}
