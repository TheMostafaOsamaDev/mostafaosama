"use client";
import useScreenSizes from "@/hooks/useScreenSizes"
import Header from "./Normal_Nav/Header";
import BurgerMenu from "./Side_Nav/BurgerMenu";

function MainNavbar() {
  let { width, height } = useScreenSizes();

  if(width >= 767) {
    if(typeof document !== undefined) {
      document.body.style.overflow = "";
    }
    return(
      <>
        <Header />
        <BurgerMenu mode="lg" screenHeight={height} />
      </>
    )
  }
  else {
    if(typeof document !== undefined) {
      document.body.style.overflow = "";
    }
    return <BurgerMenu mode="sm" />
  }
}

export default MainNavbar
