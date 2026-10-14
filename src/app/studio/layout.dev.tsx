import type { ReactNode } from "react";
import { RootDocument } from "@/components/RootDocument";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { fontVariables as arabic } from "@/fonts/site-arabic";
import { fontVariables as latin } from "@/fonts/site-latin";
import "../globals.css";

// Development only: the studios' own root layout (the site's are app/(en) and app/ar). The studios are in English.
export default function StudioRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument lang="en" dir="ltr" fontClass={`${latin} ${arabic}`}>
      {children}
      <ButtonEffects />
    </RootDocument>
  );
}
