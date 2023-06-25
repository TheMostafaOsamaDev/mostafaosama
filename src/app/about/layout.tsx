import React, { ReactNode } from 'react'

export const metadata = {
  title: "About Me",
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
