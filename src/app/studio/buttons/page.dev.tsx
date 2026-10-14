import type { Metadata } from "next";
import { buttonSettings } from "@/components/ui/button-settings";
import { ButtonStudio } from "./ButtonStudio";

// Development only (see next.config.ts): choosing the site's buttons.
export const metadata: Metadata = { title: "Button studio", robots: { index: false, follow: false } };

export default function ButtonStudioPage() {
  return <ButtonStudio saved={buttonSettings} />;
}
