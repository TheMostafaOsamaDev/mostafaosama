"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/LabFrame";
import { Slider } from "@/lab/shared/controls";
import { LimiterChart } from "./chart";
import { CONFIG, simulate } from "./model";

gsap.registerPlugin(useGSAP);

export default function TwoLimiters() {
  const [burst, setBurst] = useState(40);
  const root = useRef<HTMLDivElement>(null);
  const result = useMemo(() => simulate({ burst }), [burst]);

  // Sweep left to right on each change: the same requests reaching both limiters at the same time.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cols = gsap.utils.toArray<SVGGElement>("[data-col]", root.current);
        const perStrip = cols.length / 2;
        gsap.from(cols, {
          opacity: 0,
          duration: 0.2,
          stagger: (i) => ((i % perStrip) / perStrip) * 0.5,
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [result] },
  );

  const tb = result.tokenBucket;
  const sw = result.slidingWindow;
  return (
    <div ref={root}>
      <LabFrame
        controls={
          <div className="w-56">
            <Slider
              label={`Burst at ${CONFIG.burstAt}s`}
              value={burst}
              min={10}
              max={60}
              step={5}
              format={(v) => `${v} requests`}
              onChange={setBurst}
            />
          </div>
        }
        figure={
          <>
            <LimiterChart result={result} />
            <figcaption className="mt-3 text-small text-muted">
              The same {result.requests} requests reach both limiters: two a second, plus one burst. Ink were accepted,
              red rejected. The burst column is compressed (see the break) and split by proportion, so ordinary traffic
              stays readable.
            </figcaption>
          </>
        }
        readout={
          sw.steadyRejectedFor === 0 ? (
            <p>
              A burst of {burst} fits inside both limits, so they behave the same. Push it higher and they part ways.
            </p>
          ) : (
            <p>
              Both limiters let <b className="font-semibold tabular-nums">{tb.burstAccepted}</b> of the {burst} burst
              requests through. The token bucket refills faster than ordinary traffic drains it, so everything after the
              burst is accepted. The sliding window still counts the burst for a full{" "}
              {CONFIG.slidingWindow.windowSeconds} seconds, so it turns away ordinary traffic for{" "}
              <b className="font-semibold text-err tabular-nums">{sw.steadyRejectedFor.toFixed(1)}s</b> after it.
            </p>
          )
        }
      />
    </div>
  );
}
