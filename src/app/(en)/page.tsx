import { HomePage } from "@/components/home/HomePage";
import { homeSettings } from "@/components/home/home";
import { PageTransition } from "@/components/site-nav/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <HomePage settings={homeSettings} locale="en" />
    </PageTransition>
  );
}
