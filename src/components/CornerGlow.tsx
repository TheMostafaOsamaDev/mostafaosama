"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// React Bits' Grainient, installed unmodified from the registry. WebGL only exists in the browser and the
// glow is decoration, so it loads after the page and never on the server.
const Grainient = dynamic(() => import("./Grainient"), { ssr: false });

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * One palette for both themes. It starts with the dark page background, twice: a radial Grainient is still
 * mid-ramp at the edge of its canvas, so the extra stop makes the colour reach the background before the
 * edge and the glow dissolves into the page instead of leaving a ring. Light mode uses Grainient's own
 * `lightMode`, which turns those background stops into pure white and lifts the tints; that's why the light
 * page background is exactly #ffffff.
 */
const PALETTE = ["#0b0c0f", "#0b0c0f", "#0e161d", "#16303f", "#2a5568", "#7fa7b4"];

/** Remounts after a GPU reset at most this often, so a broken GPU can't put it in a loop. */
const RECOVER_AFTER_MS = 1000;
const MAX_RECOVERIES = 3;

export function CornerGlow() {
  const scheme = useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light"),
    () => null,
  );
  const frame = useRef<HTMLDivElement>(null);
  const [generation, setGeneration] = useState(0);

  // Browsers drop WebGL contexts on GPU resets (sleep and wake, switching graphics cards). Grainient doesn't
  // restore its context, so give it a fresh canvas instead. Its own cleanup loses the context of a canvas
  // that has already left the page, and that event never reaches this element, so it isn't mistaken for one.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let timer = 0;
    let recoveries = 0;
    const onLost = () => {
      if (recoveries >= MAX_RECOVERIES) return;
      recoveries++;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setGeneration((g) => g + 1), RECOVER_AFTER_MS);
    };
    el.addEventListener("webglcontextlost", onLost, true);
    return () => {
      el.removeEventListener("webglcontextlost", onLost, true);
      window.clearTimeout(timer);
    };
  }, [scheme]);

  if (!scheme) return null;

  return (
    <div
      ref={frame}
      aria-hidden
      // A square centred on the top-right corner: only its inner quarter is on screen. The mask fades the
      // grain out with the colour, so no edge of the canvas is ever visible. Pointer events stay off so it
      // never blocks the page; Grainient tracks the pointer on the window, so hover still reaches it.
      className="pointer-events-none fixed top-0 right-0 z-0 aspect-square w-[min(72vmin,760px)] translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000_30%,rgb(0_0_0/0.55)_60%,transparent_92%)]"
    >
      <Grainient
        key={`${scheme}-${generation}`}
        colors={PALETTE}
        lightMode={scheme === "light"}
        type="radial"
        bands={1}
        softness={1}
        flow={1}
        scale={1}
        speed={0.6}
        silk={0.2}
        grainAmount={0.05}
        grainSize={1.2}
        grainAnimated={false}
        contrast={1}
        saturation={1}
        interactive
        stir={1}
        clickSwirl={false}
        intro
        dpr={1}
      />
    </div>
  );
}
