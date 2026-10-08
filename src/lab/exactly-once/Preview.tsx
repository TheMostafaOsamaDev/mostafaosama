import { OnceChart } from "./chart";
import { simulate } from "./model";

/** Twelve payments and their redeliveries, rendered on the server for the lab index. */
export default function ExactlyOncePreview() {
  return <OnceChart result={simulate({ lostAcks: 0.35, seed: 11 })} compact />;
}
