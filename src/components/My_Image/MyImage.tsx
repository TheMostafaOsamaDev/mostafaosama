"use client";
import "./index.css";
import Image  from "next/image";
import myImage from "@/assets/my_image.jpg";
import { motion } from "framer-motion";

function MyImage() {
  console.log(myImage)

  return (
      <motion.div className="personal-image-container"
      initial={{
        filter: "grayscale(0)",
        x: 80,
        y: 80,
        opacity: 0
      }}

      animate={{
        x: -5,
        y: -5,
        opacity: 1
      }}

      whileHover={{
        x: 0,
        y: 0,
        filter: "grayscale(100%)"
      }}

      transition={{
        duration: 1,
        type: "spring"
      }}
      >
          <img
          className="rounded-md object-cover h-full w-full m-auto"
          src={myImage.src}
          alt="Mostafa Osama"
          loading="lazy"
        />
      </motion.div>
  )
}

export default MyImage
