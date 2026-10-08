import { CONFIG, type LimiterResult, type Strip } from "./model";

const W = 600;
const H = 90;

function StripChart({ strip, yMax, label, compact }: { strip: Strip; yMax: number; label: string; compact: boolean }) {
  const n = strip.accepted.length;
  const bw = W / n;
  const h = (v: number) => (v / yMax) * H;
  return (
    <div>
      {compact ? null : (
        <p className="mb-1.5 flex justify-between gap-4 text-small">
          <span>{label}</span>
          <span className="text-muted tabular-nums">
            {strip.acceptedTotal} accepted,{" "}
            <span className={strip.rejectedTotal ? "text-err" : ""}>{strip.rejectedTotal} rejected</span>
          </span>
        </p>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={`block w-full ${compact ? "h-12" : "h-24"}`}
        aria-hidden
      >
        {compact ? (
          <>
            <path d={stack(strip, yMax, bw, "accepted")} className="fill-ink" />
            <path d={stack(strip, yMax, bw, "rejected")} className="fill-err" />
          </>
        ) : (
          strip.accepted.map((a, i) => {
            const r = strip.rejected[i];
            const total = a + r;
            // Too tall for the scale: draw it full height, split by proportion, with a break mark near the top.
            const scaled = total > yMax;
            const ha = scaled ? (a / total) * H : h(a);
            const hr = scaled ? (r / total) * H : h(r);
            return (
              <g key={i} data-col>
                <rect x={i * bw} width={bw * 0.7} y={H - ha} height={ha} className="fill-ink" />
                <rect x={i * bw} width={bw * 0.7} y={H - ha - hr} height={hr} className="fill-err" />
                {scaled ? (
                  <rect x={i * bw - 2} width={bw * 0.7 + 4} y={H * 0.12} height={3} className="fill-paper" />
                ) : null}
              </g>
            );
          })
        )}
        <line x1={0} x2={W} y1={H} y2={H} className="stroke-hairline" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** Both limiters fed the same requests, on one time axis. Pure markup for the server-rendered preview. */
export function LimiterChart({ result, compact = false }: { result: LimiterResult; compact?: boolean }) {
  const all = [result.tokenBucket, result.slidingWindow].flatMap((s) => s.accepted.map((a, i) => a + s.rejected[i]));
  // Burst columns are tall; cap the scale so ordinary traffic stays visible, and let the burst clip.
  const yMax = Math.min(Math.max(...all), 12);
  const { tokenBucket: tb, slidingWindow: sw } = CONFIG;
  return (
    <div className="grid gap-5">
      <StripChart
        strip={result.tokenBucket}
        yMax={yMax}
        compact={compact}
        label={`Token bucket: holds ${tb.capacity}, refills ${tb.refillPerSecond} a second`}
      />
      <StripChart
        strip={result.slidingWindow}
        yMax={yMax}
        compact={compact}
        label={`Sliding window: ${sw.limit} per ${sw.windowSeconds} seconds`}
      />
      {compact ? null : (
        <div className="-mt-3 flex justify-between text-small text-muted tabular-nums" aria-hidden>
          {[0, 5, 10, 15, 20].map((t) => (
            <span key={t}>{t}s</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** One series of the stacked columns as a single path, for the compact preview. Same proportional rule as above. */
function stack(strip: Strip, yMax: number, bw: number, part: "accepted" | "rejected"): string {
  return strip.accepted
    .map((a, i) => {
      const r = strip.rejected[i];
      const total = a + r;
      const k = total > yMax ? H / total : H / yMax;
      const [from, size] = part === "accepted" ? [0, a * k] : [a * k, r * k];
      if (size <= 0) return "";
      return `M${(i * bw).toFixed(2)} ${(H - from).toFixed(2)}v${(-size).toFixed(2)}h${(bw * 0.7).toFixed(2)}v${size.toFixed(2)}Z`;
    })
    .join("");
}
