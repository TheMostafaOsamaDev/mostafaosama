"use client";
import "./index.css"
import BurgerIcon from "./BurgerIcon";
import Menu from "./Menu";
import { useState } from "react";

function BurgerMenu({
  mode,
  screenHeight,
}: {
  mode: "sm" | "lg";
  screenHeight?: number;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <BurgerIcon mode={mode} screenHeight={screenHeight} setIsOpen={setIsOpen}/>
      <Menu isOpen={isOpen} />
    </>
  );
}

export default BurgerMenu;
