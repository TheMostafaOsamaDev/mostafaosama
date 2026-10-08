"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/LabFrame";
import { Button, Slider } from "@/lab/shared/controls";
import { OnceChart } from "./chart";
import { simulate } from "./model";

gsap.registerPlugin(useGSAP);

const money = (n: number) => `$${n.toLocaleString("en")}`;

export default function ExactlyOnce() {
  const [lostAcks, setLostAcks] = useState(0.3);
  const [seed, setSeed] = useState(11);
  const root = useRef<HTMLDivElement>(null);
  const result = useMemo(() => simulate({ lostAcks, seed }), [lostAcks, seed]);

  // Replay the deliveries in arrival order, so redeliveries visibly come after the originals.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", root.current);
        dots.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
        gsap.from(dots, { scale: 0, opacity: 0, duration: 0.2, ease: "back.out(2)", stagger: Math.min(0.03, 0.6 / dots.length) });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [result] },
  );

  const over = result.withoutKey.total - result.expected;
  const repeats = result.log.length - result.payments.length;
  return (
    <div ref={root}>
      <LabFrame
        controls={
          <>
            <div className="w-56">
              <Slider
                label="Lost acknowledgements"
                value={lostAcks}
                min={0}
                max={0.6}
                step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={setLostAcks}
              />
            </div>
            <Button onClick={() => setSeed((s) => s + 1)}>Run again</Button>
          </>
        }
        figure={
          <>
            <OnceChart result={result} />
            <figcaption className="mt-3 text-small text-muted">
              Solid dots are first deliveries. Red rings are the same message delivered again after its acknowledgement was
              lost.
            </figcaption>
          </>
        }
        readout={
          repeats === 0 ? (
            <p>Every acknowledgement arrived, so both handlers charged {money(result.expected)}. Enjoy it while it lasts.</p>
          ) : (
            <p>
              The queue delivered <b className="font-semibold tabular-nums">{result.log.length}</b> messages for{" "}
              {result.payments.length} payments. The handler without a key charged every one of them:{" "}
              <b className="font-semibold text-err tabular-nums">{money(result.withoutKey.total)}</b> for{" "}
              {money(result.expected)} of orders, {money(over)} too much. The handler with a key stored each payment id
              before charging, so the {repeats} {repeats === 1 ? "repeat" : "repeats"} found it already there and did
              nothing.
            </p>
          )
        }
      />
    </div>
  );
}
