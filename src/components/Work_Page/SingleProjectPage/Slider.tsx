"use client";
import { motion } from "framer-motion";
import {RefObject, useEffect, useRef, useState} from "react";

interface Props {
  paths: string[];
  title: string;
}

function Slider({ paths, title }: Props) {
  const [width, setWidth] = useState<number>(0);
  const carRef = useRef<HTMLDivElement>();

  useEffect(() => {
  if(carRef.current)
    setWidth(carRef.current?.scrollWidth - carRef.current?.offsetWidth)

  }, []);

  const images = paths.map((path, index) => (
    <motion.div key={"slider-img-"+title+"-"+index} className="item">
      <img src={path} alt={title}  />
    </motion.div>
  ));

  return (
    <motion.div className="carousel"
      ref={carRef as any}
    >
      <motion.div className="inner-carousel"
        drag="x"
        dragConstraints={{
          right: 0,
          left: width * -1
        }}
      >
        {images}
      </motion.div>
    </motion.div>
  );
}

export default Slider;
