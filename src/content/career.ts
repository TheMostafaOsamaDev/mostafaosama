import type { SpanDate } from "@/lib/time";

export type Role = {
  id: string;
  label: string;
  start: SpanDate;
  /** `null` means the role is ongoing. */
  end: SpanDate | null;
  /** The critical path. Exactly one span on the site should have this. */
  critical?: boolean;
  /** When set, this role opens the project entry with the same id. */
  entry?: string;
};

// Dates: CV (Onvaca 08/2024, freelance 2022–2024, university 2020–2024).
// Year-only dates are drawn from mid-year; the label shows the years as written on the CV.
export const roles: Role[] = [
  { id: "university", label: "Beni Suef University, CS and AI", start: "2020", end: "2024" },
  { id: "freelance", label: "Freelance web developer", start: "2022", end: "2024" },
  { id: "onvaca", label: "Onvaca: full stack", start: "2024-08", end: null, critical: true, entry: "onvaca" },
];
