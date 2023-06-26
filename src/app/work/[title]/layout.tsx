import { ReactNode, Suspense } from "react";
import Loading from "./loading";

function Layout({ children }: { children: ReactNode }) {
  return <main className="pt-10">
    <Suspense fallback={<Loading/>}>
    {children}
    </Suspense>
  </main>;
}

export default Layout;
