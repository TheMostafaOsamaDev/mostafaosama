import { LimiterChart } from "./chart";
import { simulate } from "./model";

/** Both limiters after a burst of 40, rendered on the server for the lab index. */
export default function TwoLimitersPreview() {
  return <LimiterChart result={simulate({ burst: 40 })} compact />;
}
