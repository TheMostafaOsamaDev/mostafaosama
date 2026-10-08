import { roles } from "@/content/career";
import { projects, type Project } from "@/content/projects";
import { BUILD_DATE, formatDuration, formatRange, toYear } from "@/lib/time";

export type TraceRow = {
  id: string;
  label: string;
  /** Position on the axis, 0–100. */
  left: number;
  width: number;
  duration: string;
  range: string;
  critical: boolean;
  child: boolean;
  ongoing: boolean;
  entry: Project | null;
};

export type TraceAxis = { ticks: { label: string; at: number }[] };

const AXIS_START = 2020;

/** Roles and projects merged into one waterfall, ordered by start like a real trace. */
export function buildTrace(): { rows: TraceRow[]; axis: TraceAxis } {
  const axisEnd = toYear(null, "end");
  const pct = (year: number) => ((year - AXIS_START) / (axisEnd - AXIS_START)) * 100;
  const byId = new Map(projects.map((p) => [p.id, p]));
  const opened = new Set(roles.flatMap((r) => (r.entry ? [r.entry] : [])));

  const items = [
    ...roles.map((r) => ({ ...r, entry: r.entry ? (byId.get(r.entry) ?? null) : null, parent: undefined })),
    ...projects
      .filter((p) => !opened.has(p.id))
      .map((p) => ({
        id: p.id,
        label: p.name,
        start: p.start,
        end: p.end,
        critical: false,
        entry: p,
        parent: p.parent,
      })),
  ];

  const sorted = items
    .map((it) => ({ ...it, s: toYear(it.start, "start"), e: toYear(it.end, "end") }))
    .sort((a, b) => a.s - b.s);

  // Children follow their parent directly, the way a trace nests spans.
  const ordered = sorted.filter((it) => !it.parent);
  for (const child of sorted.filter((it) => it.parent)) {
    const at = ordered.findIndex((it) => it.id === child.parent);
    ordered.splice(at + 1, 0, child);
  }

  const rows: TraceRow[] = ordered.map((it) => {
    const left = pct(it.s);
    return {
      id: it.id,
      label: it.label,
      left,
      width: Math.max(pct(it.e) - left, 0.9),
      duration: formatDuration(it.start, it.end),
      range: formatRange(it.start, it.end),
      critical: Boolean(it.critical),
      child: Boolean(it.parent),
      ongoing: it.end === null,
      entry: it.entry,
    };
  });

  const ticks = [];
  for (let y = AXIS_START; y <= BUILD_DATE.getUTCFullYear(); y++) ticks.push({ label: String(y), at: pct(y) });
  return { rows, axis: { ticks } };
}
