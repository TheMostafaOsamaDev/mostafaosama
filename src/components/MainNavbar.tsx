"use client";
import useScreenSizes from "@/hooks/useScreenSizes";
import Header from "./Normal_Nav/Header";
import BurgerMenu from "./Side_Nav/BurgerMenu";

function MainNavbar() {
  let { height, isMobile } = useScreenSizes();

  console.log(isMobile)

  if(isMobile) {
    return <BurgerMenu mode="sm" screenHeight={height} />
  }

  return (
    <>
      <Header />
      <BurgerMenu mode="lg" screenHeight={height} />
    </>
  );
}

export default MainNavbar;
