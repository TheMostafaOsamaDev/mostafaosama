import { RetryChart } from "./chart";
import { simulate } from "./model";

/** The storm at its worst, rendered on the server for the lab index. */
export default function RetryStormPreview() {
  const result = simulate({ clients: 500, jitter: false });
  return <RetryChart result={result} yMax={Math.max(...result.arrivals) * 1.08} compact />;
}
