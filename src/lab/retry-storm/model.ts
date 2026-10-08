import { createRandom } from "@/lab/shared/random";

export const CONFIG = {
  /** Seconds the service is down from the start. */
  outage: 5,
  /** Requests per second the service can serve once it is back. */
  capacity: 150,
  /** Exponential backoff: base * 2^attempt, capped. Seconds. */
  base: 0.25,
  cap: 4,
  /** Clients send their first request spread over this window. Seconds. */
  firstWave: 0.5,
  bucket: 0.1,
  horizon: 30,
} as const;

export type RetryParams = { clients: number; jitter: boolean; seed?: number };

export type RetryResult = {
  /** Requests that arrived in each bucket, and how many of them were served. */
  arrivals: number[];
  served: number[];
  /** The busiest moment after the service comes back, in requests per second. */
  peakPerSecond: number;
  /** Seconds after the outage ends when the last client got through, or null if some never did. */
  recoveredAfter: number | null;
  waiting: number;
  attempts: number;
};

export function simulate({ clients, jitter, seed = 7 }: RetryParams): RetryResult {
  const { outage, capacity, base, cap, firstWave, bucket, horizon } = CONFIG;
  const random = createRandom(seed);
  const buckets = Math.round(horizon / bucket);
  const perBucket = Math.floor(capacity * bucket);

  const next = Float64Array.from({ length: clients }, () => random() * firstWave);
  // Scheduling is by integer bucket index; comparing float boundaries drops retries at the edges.
  const due = Int32Array.from(next, (t) => Math.floor(t / bucket));
  const attempt = new Uint16Array(clients);
  const done = new Uint8Array(clients);
  const arrivals = new Array<number>(buckets).fill(0);
  const served = new Array<number>(buckets).fill(0);
  let lastServedAt = 0;
  let attempts = 0;

  for (let b = 0; b < buckets; b++) {
    const t0 = b * bucket;
    const arriving: number[] = [];
    for (let c = 0; c < clients; c++) if (!done[c] && due[c] === b) arriving.push(c);
    arriving.sort((x, y) => next[x] - next[y]);
    arrivals[b] = arriving.length;
    attempts += arriving.length;

    arriving.forEach((c, i) => {
      const up = t0 >= outage;
      if (up && i < perBucket) {
        done[c] = 1;
        served[b]++;
        lastServedAt = next[c];
        return;
      }
      attempt[c]++;
      const backoff = Math.min(cap, base * 2 ** attempt[c]);
      next[c] += jitter ? random() * backoff : backoff;
      // A retry can't land in the bucket being processed; the earliest it goes is the next one.
      due[c] = Math.max(Math.floor(next[c] / bucket), b + 1);
    });
  }

  const waiting = clients - done.reduce((n, d) => n + d, 0);
  return {
    arrivals,
    served,
    peakPerSecond: Math.round(Math.max(...arrivals.slice(Math.round(outage / bucket))) / bucket),
    recoveredAfter: waiting === 0 ? Math.round((lastServedAt - outage) * 10) / 10 : null,
    waiting,
    attempts,
  };
}
