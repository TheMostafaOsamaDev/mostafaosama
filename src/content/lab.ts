export type LabEntry = {
  slug: "retry-storm" | "exactly-once" | "two-limiters";
  title: string;
  /** One line for the index. Dry humor is allowed in the lab. */
  summary: string;
  /** The idea behind it, shown above the experiment. */
  intro: string;
  year: number;
};

export const lab: LabEntry[] = [
  {
    slug: "retry-storm",
    title: "Retry storm",
    summary: "Five hundred clients retry a service that just came back. Add jitter and watch the spike flatten.",
    intro:
      "A service goes down for five seconds. Every client retries with exponential backoff, and without jitter they all retry at the same moments, so the service that just recovered gets knocked over by its own clients.",
    year: 2026,
  },
  {
    slug: "exactly-once",
    title: "Exactly once, allegedly",
    summary: "A queue that redelivers, and two payment handlers. Only one of them checks an idempotency key.",
    intro:
      "Queues promise at-least-once delivery. When an acknowledgement is lost, the message comes back. A payment handler that charges on every delivery will charge some customers twice; one that records the message id first will not.",
    year: 2026,
  },
  {
    slug: "two-limiters",
    title: "Same burst, two limiters",
    summary: "A token bucket and a sliding window allow the same rate. They disagree about what happens after a burst.",
    intro:
      "Both limiters allow three requests a second on average. Feed them a steady trickle and one burst, and the token bucket recovers at once while the sliding window keeps punishing ordinary traffic until the burst ages out.",
    year: 2026,
  },
];

export const getLabEntry = (slug: string) => lab.find((e) => e.slug === slug) ?? null;
