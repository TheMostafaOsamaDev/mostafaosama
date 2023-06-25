"use client";

import { useEffect, useState } from "react";

function useScreenSizes() {
  if (typeof window === "undefined") 
    return [0, 0];

  const currWidth = window?.innerWidth;
  const currHeight = 0;

  const [width, setWidth] = useState(currWidth);
  const [height, setHeight] = useState(currHeight);

  useEffect(() => {

    const getScreenWidth = (e : Event) => {
      setWidth(window?.innerWidth);
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

  return {
    width,
    height
  };
}

export default useScreenSizes
