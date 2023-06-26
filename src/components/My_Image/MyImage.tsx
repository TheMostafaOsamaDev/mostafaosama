"use client";
import "./index.css";
import Image from "next/image";
import myImage from "@/assets/my_image.jpg";
import { motion } from "framer-motion";

function MyImage() {
  return (
    <motion.div
      className="personal-image-container"
      initial={{
        filter: "grayscale(0)",
        x: 80,
        y: 80,
        opacity: 0,
      }}
      animate={{
        x: -5,
        y: -5,
        opacity: 1,
      }}
      whileHover={{
        x: 0,
        y: 0,
        filter: "grayscale(100%)",
      }}
      transition={{
        duration: 1,
        type: "spring",
      }}
    >
      <Image
        className="rounded-md object-cover h-full w-full m-auto"
        src={myImage.src}
        alt="Mostafa Osama"
        width={2000}
        height={2000}
        quality={100}
        priority={true}
      />

      <div className="title-container">
        <motion.h1
          initial={{
            y: 200,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: 1,
            duration: 0.8,
            type: "spring"
          }}
        >
          {" < "} web.developer {" /> "}
        </motion.h1>
      </div>
    </motion.div>
  );
}

export default MyImage;
