"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { glowPalette, glowSettings, type GlowSettings } from "./glow";
import { usePreferences } from "./preferences";

// React Bits' Grainient, installed unmodified from the registry. WebGL only exists in the browser and the
// glow is decoration, so it loads after the page and never on the server.
const Grainient = dynamic(() => import("./Grainient"), { ssr: false });

/** Remounts after a GPU reset at most this often, so a broken GPU can't put it in a loop. */
const RECOVER_AFTER_MS = 1000;
const MAX_RECOVERIES = 3;

/** The site's glow: saved settings, following the visitor's colour scheme (or their theme choice). */
export function CornerGlow() {
  const prefs = usePreferences();
  if (!prefs) return null;
  return <CornerGlowView settings={glowSettings} scheme={prefs.dark ? "dark" : "light"} />;
}

/**
 * The grain layer and the corner glow. The glow's palette comes from `glowPalette`, which puts the page colour in
 * front so the glow dissolves into the page (see glow.ts); light mode uses `lightColors` over white. The grain layer
 * uses Grainient's own `lightMode`, which turns its background stops into pure white, so the light page is #ffffff.
 */
function CornerGlowView({ settings, scheme }: { settings: GlowSettings; scheme: "light" | "dark" }) {
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

  const {
    reach: darkReach,
    maxReach: darkMax,
    lightReach,
    lightMaxReach,
    attach,
    lightGrain,
    lightColors,
    ...rest
  } = settings;
  const light = scheme === "light";
  const reachVmin = light ? lightReach : darkReach;
  const maxReach = light ? lightMaxReach : darkMax;
  const grain = light ? { ...rest, grainAmount: rest.grainAmount * lightGrain } : rest;
  const reach = `min(${reachVmin}vmin, ${maxReach}px)`;

  return (
    // One wrapper so the context-loss listener above covers both canvases; `contents` keeps it out of layout.
    <div ref={frame} aria-hidden className="contents">
      {/* The grain layer: Grainient's own noise over the whole viewport, on a flat page colour (the first palette
          colour, or white in light mode). With no motion, intro or interaction it draws once and then idles. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grainient
          key={`grain-${scheme}-${generation}`}
          colors={[grain.background, grain.background]}
          type="linear"
          speed={0}
          flow={0}
          silk={0}
          grainAmount={grain.grainAmount}
          grainSize={grain.grainSize}
          grainAnimated={grain.grainAnimated}
          interactive={false}
          clickSwirl={false}
          intro={false}
          lightMode={light}
          dpr={1}
        />
      </div>

      {/* The glow: a box as big as its reach, in the top-right corner, above the grain layer. It clips, so in
          "page" mode the off-screen part can't widen the page. Pointer events stay off so it never blocks the
          page; Grainient tracks the pointer on the window, so hover still reaches it. */}
      <div
        className={`pointer-events-none ${attach === "fixed" ? "fixed" : "absolute"} top-0 right-0 z-0 overflow-hidden`}
        style={{ width: reach, height: reach }}
      >
        {/* A square centred on the corner: only its inner quarter is inside the box. The mask fades it into the
            grain layer underneath, so no edge of the canvas is ever visible. */}
        <div
          className="absolute top-0 right-0 aspect-square translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,#000_30%,rgb(0_0_0/0.55)_60%,transparent_92%)]"
          style={{ width: `calc(2 * ${reach})` }}
        >
          <Grainient
            key={`${scheme}-${generation}`}
            {...grain}
            colors={glowPalette({ ...grain, lightColors }, light)}
            dpr={1}
          />
        </div>
      </div>
    </div>
  );
}
