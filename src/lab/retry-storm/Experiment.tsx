"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/LabFrame";
import { Segmented, Slider } from "@/lab/shared/controls";
import { RetryChart } from "./chart";
import { CONFIG, simulate } from "./model";

gsap.registerPlugin(useGSAP);

type Mode = "fixed" | "jitter";

export default function RetryStorm() {
  const [clients, setClients] = useState(500);
  const [mode, setMode] = useState<Mode>("fixed");
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef<{ y: string | null; height: string | null }[] | null>(null);

  const { result, yMax } = useMemo(() => {
    const fixed = simulate({ clients, jitter: false });
    const jitter = simulate({ clients, jitter: true });
    // One scale for both modes, so switching shows the difference instead of rescaling it away.
    const peak = Math.max(...fixed.arrivals, ...jitter.arrivals);
    return { result: mode === "jitter" ? jitter : fixed, yMax: peak * 1.08 };
  }, [clients, mode]);

  // Morph each bar from its old height to its new one, so the change reads as cause and effect.
  useGSAP(
    () => {
      const rects = gsap.utils.toArray<SVGRectElement>("[data-bars] rect", root.current);
      const before = previous.current;
      previous.current = rects.map((r) => ({ y: r.getAttribute("y"), height: r.getAttribute("height") }));
      if (!before || before.length !== rects.length) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        rects.forEach((r, i) => {
          gsap.from(r, { attr: { y: Number(before[i].y), height: Number(before[i].height) }, duration: 0.45, ease: "power2.out" });
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [result, yMax] },
  );

  const recovered = result.recoveredAfter;
  return (
    <div ref={root}>
      <LabFrame
        controls={
          <>
            <Segmented<Mode>
              label="Backoff"
              value={mode}
              onChange={setMode}
              options={[
                { value: "fixed", label: "Exponential" },
                { value: "jitter", label: "With full jitter" },
              ]}
            />
            <div className="w-56">
              <Slider label="Clients" value={clients} min={100} max={1000} step={50} onChange={setClients} />
            </div>
          </>
        }
        figure={
          <>
            <RetryChart result={result} yMax={yMax} />
            <figcaption className="mt-3 text-small text-muted">
              Requests arriving every 100ms. The shaded stretch is the outage. Ink were served, red failed and will retry.
              The dashed line is capacity, {CONFIG.capacity} a second.
            </figcaption>
          </>
        }
        readout={
          mode === "fixed" ? (
            <p>
              The service comes back at {CONFIG.outage}s, and the clients come back with it, all at once. Load peaks at{" "}
              <b className="font-semibold tabular-nums">{result.peakPerSecond.toLocaleString("en")}</b> requests a second
              against a capacity of {CONFIG.capacity}, so most of each wave fails and retries together again.{" "}
              {recovered === null ? (
                <>
                  After {CONFIG.horizon}s, <b className="font-semibold tabular-nums">{result.waiting}</b> of {clients} clients
                  are still waiting.
                </>
              ) : (
                <>Everyone is through {recovered}s after recovery, the hard way.</>
              )}
            </p>
          ) : (
            <p>
              With full jitter each client waits a random part of its backoff, so the same {clients} clients peak at{" "}
              <b className="font-semibold tabular-nums">{result.peakPerSecond.toLocaleString("en")}</b> requests a second.{" "}
              {recovered === null ? (
                <>Some are still waiting at {CONFIG.horizon}s.</>
              ) : (
                <>
                  Everyone is through <b className="font-semibold tabular-nums">{recovered}s</b> after the service recovers.
                </>
              )}
            </p>
          )
        }
      />
    </div>
  );
}
