import { CONFIG, type RetryResult } from "./model";

const W = 600;
const H = 200;

/**
 * Requests per 100ms over 30s. Served requests in ink, failed ones in the error color, the outage
 * shaded, capacity as a dashed line. Pure SVG: the lab index renders it on the server as a preview.
 */
export function RetryChart({
  result,
  yMax,
  compact = false,
}: {
  result: RetryResult;
  yMax: number;
  compact?: boolean;
}) {
  const n = result.arrivals.length;
  const bw = W / n;
  const y = (v: number) => H - (v / yMax) * H;
  const capY = y(CONFIG.capacity * CONFIG.bucket);
  const outageW = (CONFIG.outage / CONFIG.horizon) * W;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className={`block w-full ${compact ? "h-28" : "h-56"}`}
        aria-hidden
      >
        <rect x={0} y={0} width={outageW} height={H} className="fill-hairline/60" />
        {compact ? (
          <>
            <path d={columns(result.arrivals, bw, y)} className="fill-err" />
            <path d={columns(result.served, bw, y)} className="fill-ink" />
          </>
        ) : (
          <g data-bars>
            {result.arrivals.map((a, i) => {
              const s = result.served[i];
              return (
                <g key={i}>
                  <rect data-failed x={i * bw} width={bw * 0.8} y={y(a)} height={H - y(a - s)} className="fill-err" />
                  <rect data-served x={i * bw} width={bw * 0.8} y={y(s)} height={H - y(s)} className="fill-ink" />
                </g>
              );
            })}
          </g>
        )}
        <line
          x1={0}
          x2={W}
          y1={capY}
          y2={capY}
          className="stroke-crit"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          vectorEffect="non-scaling-stroke"
        />
        <line x1={0} x2={W} y1={H} y2={H} className="stroke-hairline" vectorEffect="non-scaling-stroke" />
      </svg>
      {compact ? null : (
        <>
          <div className="mt-1 flex justify-between text-small text-muted tabular-nums" aria-hidden>
            {[0, 5, 10, 15, 20, 25, 30].map((t) => (
              <span key={t}>{t}s</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** All columns of a series as a single path: one DOM node instead of one per bucket. */
function columns(values: number[], bw: number, y: (v: number) => number): string {
  return values
    .map((v, i) => (v > 0 ? `M${(i * bw).toFixed(2)} ${H}V${y(v).toFixed(2)}h${(bw * 0.8).toFixed(2)}V${H}Z` : ""))
    .join("");
}
