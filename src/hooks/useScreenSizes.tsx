"use client";

import { useEffect, useState } from "react";

function useScreenSizes() {
  let currWidth = 0;
  const currHeight = 0;

  if (typeof window !== "undefined") {
    currWidth = window?.innerWidth;
  }

  const [width, setWidth] = useState(currWidth);
  const [height, setHeight] = useState(currHeight);
  const [isMobile, setIsMobile] = useState(false);

  const checkIfMobileView = (width : number) => {
    if(width < 767) {
      console.log("Width: ",width < 767)
      return setIsMobile(true);
    } 
    return setIsMobile(false);
  }

  useEffect(() => {

    const getScreenWidth = (e : Event) => {
      const newWidth = window?.innerWidth;
      setWidth(newWidth);
      checkIfMobileView(newWidth);
    }

    const getScreenHeight = (e : Event) => {
      setHeight(window?.scrollY);
    }

    window?.addEventListener('resize', getScreenWidth);
    window.addEventListener('scroll', getScreenHeight);

    return () => {
      window?.removeEventListener('resize', getScreenWidth);
      window?.removeEventListener('scroll', getScreenHeight);
    }

  }, [width, height]);

  useEffect(() => {
    checkIfMobileView(window?.innerWidth);
  }, []);

  return {
    width,
    height,
    isMobile
  };
}

export default useScreenSizes
