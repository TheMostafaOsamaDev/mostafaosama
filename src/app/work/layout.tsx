import React, { ReactNode } from 'react';

export const metadata = {
  title: "My Work",
  description:
    "My projects list.",
};

function Layout( {children} : {children: ReactNode} ) {
  return (
    <>
      {children}
    </>
  )
}

export default Layout
