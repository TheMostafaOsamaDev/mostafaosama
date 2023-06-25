"use client";
import useScreenSizes from "@/hooks/useScreenSizes";
import "./index.css";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

const marqueeVariants = {
  animate: {
    x: ["300vw", "-400vw"],
    transition: {
      duration: 36,
      repeat: Infinity,
      type: "linear",
    },
  },
};

function Marquee() {

  return (
    <motion.div
      className="marquee"
      animate="animate"
      variants={marqueeVariants}
    ></motion.div>
  );
}

export default Marquee;
