"use client";
import useScreenSizes from "@/hooks/useScreenSizes";
import Header from "./Normal_Nav/Header";
import BurgerMenu from "./Side_Nav/BurgerMenu";
import { useEffect } from "react";

function MainNavbar() {
  let { width, height } = useScreenSizes();
  let element;

  useEffect(() => {
    document.body.style.overflow = "";
  }, [width])

  if (width >= 767) {
    element = (
      <>
        <Header />
        <BurgerMenu mode="lg" screenHeight={height} />
      </>
    );
  } else {
    element = <BurgerMenu mode="sm" />;
  }

  return element;
}

export default MainNavbar;
