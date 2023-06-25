"use client";
import "./index.css";
import { motion } from "framer-motion";
import {Bitter} from "next/font/google";

const subHeaderFont = Bitter({
  weight: ["400", "700"],
  subsets: ["cyrillic"]
})

const lettersContainerVarient = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
}

const letterVarient = {
  hidden: {
    rotateX: '90deg'
  },
  show: {
    rotateX: '0deg'
  }
}

const underlineVarient = {
  hidden: {
    width: '0%'
  },
  show: {
    width: '80%'
  }
}

function SubHeader({ children, keyVal }: { children: string, keyVal: string }) {
  return (
    <h2 className={"sub-header " + subHeaderFont.className}>
      <motion.div 
        initial={'hidden'}
        whileInView={'show'}
        variants={lettersContainerVarient}>
        {children
          .split(" ")
          .join(".")
          .split("")
          .map((letter, i) => (
            <motion.span 
              key={keyVal+"-"+letter+"-"+i}
              variants={letterVarient}
              // whileHover={{
              //   rotateX: ['0deg', '90deg']
              // }}
              className="letter">{letter}</motion.span>
          ))}
      </motion.div>
      <motion.span
        initial={'hidden'}
        whileInView={'show'}
        variants={underlineVarient}
        className="line-under"></motion.span>
    </h2>
  );
}

export default SubHeader;
