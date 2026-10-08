/** "2024-08" (month precision) or "2024" (year precision, as written on the CV). */
export type SpanDate = `${number}` | `${number}-${number}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "Now" is the build date, inlined by next.config.ts. The site is static, so ongoing spans
 * end at the last deploy rather than ticking in the browser.
 */
export const BUILD_DATE = new Date(process.env.BUILD_DATE ?? "2026-10-08T00:00:00Z");

/** Decimal year. Month dates sit at the start of the month (or its end, for `end`). Year-only dates sit mid-year. */
export function toYear(date: SpanDate | null, edge: "start" | "end"): number {
  if (date === null) return BUILD_DATE.getUTCFullYear() + BUILD_DATE.getUTCMonth() / 12 + BUILD_DATE.getUTCDate() / 365;
  const [y, m] = date.split("-").map(Number);
  if (m === undefined) return y + 0.5;
  return y + (m - 1) / 12 + (edge === "end" ? 1 / 12 : 0);
}

export function formatDate(date: SpanDate | null): string {
  if (date === null) return "now";
  const [y, m] = date.split("-").map(Number);
  return m === undefined ? String(y) : `${MONTHS[m - 1]} ${y}`;
}

export function formatRange(start: SpanDate, end: SpanDate | null): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** "2y 2m", "5m", "4y". Rounded to whole months; anything shorter than a month reads "1m". */
export function formatDuration(start: SpanDate, end: SpanDate | null): string {
  const months = Math.max(1, Math.round((toYear(end, "end") - toYear(start, "start")) * 12));
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y && m) return `${y}y ${m}m`;
  return y ? `${y}y` : `${m}m`;
}
