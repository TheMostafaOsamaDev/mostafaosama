import type { LabEntry } from "@/content/lab";
import ExactlyOncePreview from "./exactly-once/Preview";
import RetryStormPreview from "./retry-storm/Preview";
import TwoLimitersPreview from "./two-limiters/Preview";

/** Server-rendered stills of each experiment's real output, for the lab index. */
export const previews: Record<LabEntry["slug"], () => React.ReactNode> = {
  "retry-storm": RetryStormPreview,
  "exactly-once": ExactlyOncePreview,
  "two-limiters": TwoLimitersPreview,
};
