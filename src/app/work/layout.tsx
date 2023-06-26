import React, { ReactNode, Suspense } from "react";
import Loading from "./loading";

export const metadata = {
  title: "My Work",
  description: "My projects list.",
};

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}

export default Layout;
