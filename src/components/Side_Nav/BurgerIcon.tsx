"use client";
import { motion, useAnimationControls } from 'framer-motion';
import React, { Dispatch, SetStateAction, useEffect } from 'react'
function BurgerIcon({
  mode,
  screenHeight,
  setIsOpen
}: {
  mode: "sm" | "lg";
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  screenHeight?: number;
}) {

  const animationControl = useAnimationControls();

  const closeOrHideBurger = () => {
    if(mode === "sm") return animationControl.start({
      scale: 1
    })

    if(screenHeight as number > 200) {
      animationControl.start({
        scale: 1
      })
    } else {
      animationControl.start({
        scale: 0
      })
    }
  }

  if(mode === "lg") {
    useEffect(() => {
      closeOrHideBurger();
    }, [screenHeight]);
  }

  const changeBurgerState = (e : any) => {
    const { currentTarget : button } = e;

    if (!button) return;
    const currentState = button.getAttribute("data-state");
    if (!currentState || currentState === "closed") {
      button.setAttribute("data-state", "opened");
      button.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setIsOpen(true);
    } else {
      button.setAttribute("data-state", "closed");
      button.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setIsOpen(false);
    }
  };



  return (
    <motion.button
      animate={animationControl}
      whileHover={{
        scale: 1.1
      }}
      className={`btn-effect burger-btn transition-all`}
      aria-controls="primary-navigation"
      aria-expanded="false"
      onClick={changeBurgerState}
    >
      <svg
        stroke="var(--button-color)"
        fill="none"
        className="hamburger content-btn"
        viewBox="-10 -10 120 120"
        width="50"
      >
        <path
          className="line"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m 20 40 h 60 a 1 1 0 0 1 0 20 h -60 a 1 1 0 0 1 0 -40 h 30 v 70"
        ></path>
      </svg>
    </motion.button>
  )
}

export default BurgerIcon
