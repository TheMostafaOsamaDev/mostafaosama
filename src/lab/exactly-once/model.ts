import { createRandom } from "@/lab/shared/random";

export const CONFIG = {
  payments: 12,
  /** A lost acknowledgement means the queue delivers again, at most this many times in total. */
  maxDeliveries: 3,
} as const;

export type Payment = { id: string; amount: number };

/** One delivery as the consumer sees it, in arrival order. Redeliveries arrive later than the original. */
export type Delivery = { id: string; amount: number; attempt: number; at: number };

export type HandlerRun = { charges: number[]; total: number };

export type OnceResult = {
  payments: Payment[];
  log: Delivery[];
  expected: number;
  /** Charges on every delivery it receives. */
  withoutKey: HandlerRun;
  /** Writes the message id to a processed set before charging, and skips ids already in it. */
  withKey: HandlerRun;
};

export function simulate({ lostAcks, seed }: { lostAcks: number; seed: number }): OnceResult {
  const random = createRandom(seed);
  const payments: Payment[] = Array.from({ length: CONFIG.payments }, (_, i) => ({
    id: `pay_${String(i + 1).padStart(2, "0")}`,
    amount: 20 + Math.floor(random() * 33) * 5,
  }));

  const log: Delivery[] = [];
  payments.forEach((p, i) => {
    let at = i + random() * 0.5;
    log.push({ ...p, attempt: 1, at });
    for (let attempt = 2; attempt <= CONFIG.maxDeliveries && random() < lostAcks; attempt++) {
      // The visibility timeout expires and the message comes back, a few messages later.
      at += 2 + random() * 4;
      log.push({ ...p, attempt, at });
    }
  });
  log.sort((a, b) => a.at - b.at);

  const withoutKey = run(log, () => true);
  const processed = new Set<string>();
  const withKey = run(log, (d) => {
    if (processed.has(d.id)) return false;
    processed.add(d.id);
    return true;
  });

  return { payments, log, expected: payments.reduce((s, p) => s + p.amount, 0), withoutKey, withKey };
}

function run(log: Delivery[], shouldCharge: (d: Delivery) => boolean): HandlerRun {
  const charges = log.map((d) => (shouldCharge(d) ? d.amount : 0));
  return { charges, total: charges.reduce((s, c) => s + c, 0) };
}
