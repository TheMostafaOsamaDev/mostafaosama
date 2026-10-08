export const CONFIG = {
  horizon: 20,
  bucket: 0.25,
  /** Steady traffic: one request every `steadyEvery` seconds. */
  steadyEvery: 0.5,
  burstAt: 5,
  /** Both limiters allow the same long-run rate: 3 requests a second. */
  tokenBucket: { capacity: 20, refillPerSecond: 3 },
  slidingWindow: { limit: 30, windowSeconds: 10 },
} as const;

export type Strip = { accepted: number[]; rejected: number[]; acceptedTotal: number; rejectedTotal: number };

export type LimiterResult = {
  requests: number;
  burst: number;
  tokenBucket: Strip & { burstAccepted: number };
  slidingWindow: Strip & { burstAccepted: number; steadyRejectedFor: number };
};

type Request = { at: number; burst: boolean };

function traffic(burst: number): Request[] {
  const { horizon, steadyEvery, burstAt } = CONFIG;
  const out: Request[] = [];
  for (let t = steadyEvery / 2; t < horizon; t += steadyEvery) out.push({ at: t, burst: false });
  for (let i = 0; i < burst; i++) out.push({ at: burstAt + i * 0.005, burst: true });
  return out.sort((a, b) => a.at - b.at);
}

function strip(requests: Request[], decisions: boolean[]): Strip {
  const n = Math.round(CONFIG.horizon / CONFIG.bucket);
  const accepted = new Array<number>(n).fill(0);
  const rejected = new Array<number>(n).fill(0);
  requests.forEach((r, i) => {
    const b = Math.min(n - 1, Math.floor(r.at / CONFIG.bucket));
    if (decisions[i]) accepted[b]++;
    else rejected[b]++;
  });
  return {
    accepted,
    rejected,
    acceptedTotal: accepted.reduce((s, v) => s + v, 0),
    rejectedTotal: rejected.reduce((s, v) => s + v, 0),
  };
}

export function simulate({ burst }: { burst: number }): LimiterResult {
  const requests = traffic(burst);

  // Token bucket: tokens refill continuously up to capacity; a request spends one or is rejected.
  const { capacity, refillPerSecond } = CONFIG.tokenBucket;
  let tokens: number = capacity;
  let last = 0;
  const tb = requests.map((r) => {
    tokens = Math.min(capacity, tokens + (r.at - last) * refillPerSecond);
    last = r.at;
    if (tokens >= 1) {
      tokens -= 1;
      return true;
    }
    return false;
  });

  // Sliding window log: accept if fewer than `limit` requests were accepted in the last window.
  const { limit, windowSeconds } = CONFIG.slidingWindow;
  const log: number[] = [];
  const sw = requests.map((r) => {
    while (log.length && log[0] <= r.at - windowSeconds) log.shift();
    if (log.length < limit) {
      log.push(r.at);
      return true;
    }
    return false;
  });

  // How long ordinary traffic was turned away after the burst, in the sliding window.
  const steadyRejects = requests.filter((r, i) => !r.burst && !sw[i]).map((r) => r.at);
  const steadyRejectedFor = steadyRejects.length ? steadyRejects[steadyRejects.length - 1] - CONFIG.burstAt : 0;

  const burstAccepted = (decisions: boolean[]) => requests.filter((r, i) => r.burst && decisions[i]).length;
  return {
    requests: requests.length,
    burst,
    tokenBucket: { ...strip(requests, tb), burstAccepted: burstAccepted(tb) },
    slidingWindow: { ...strip(requests, sw), burstAccepted: burstAccepted(sw), steadyRejectedFor },
  };
}
