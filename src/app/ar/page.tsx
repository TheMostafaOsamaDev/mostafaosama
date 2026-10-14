import { HomePage } from "@/components/home/HomePage";
import { homeSettings } from "@/components/home/home";
import { PageTransition } from "@/components/site-nav/PageTransition";

export default function ArabicHome() {
  return (
    <PageTransition>
      <HomePage settings={homeSettings} locale="ar" />
    </PageTransition>
  );
}
