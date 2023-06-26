"use client";

import Youtube from "../Icons/Youtube";
import LinkedIn from "../Icons/LinkedIn";
import GitHub from "../Icons/GitHub";
import Codepen from "../Icons/Codepen";
import Whatsapp from "../Icons/Whatsapp";
import { motion } from "framer-motion";

interface LinkProps {
  name: string;
  href: string;
}

function SingleLink({ name, href }: LinkProps) {
  let icon;

  if (name === "youtube") {
    icon = <Youtube />;
  }

  if (name === "linkedin") {
    icon = <LinkedIn />;
  }

  if (name === "github") {
    icon = <GitHub />;
  }

  if (name === "codepen") {
    icon = <Codepen />;
  }

  if(name === "whatsapp") {
    icon = <Whatsapp />
  }



  return (
      <motion.a
        whileHover={{
          scale: 1.2,
        }}
        href={href}
        target="_blank"
        key={name+"-"+"link"}
      >
        {icon}
      </motion.a>
  );
}

export default SingleLink;
