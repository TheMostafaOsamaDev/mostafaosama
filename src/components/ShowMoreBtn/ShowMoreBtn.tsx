"use client";
import "./index.css";
import Link from "next/link";
import { motion } from "framer-motion";
import Spinner from "../Icons/Spinner";
import CheckMark from "../Icons/CheckMark";
interface Props {
  children: string;
  path?: string | undefined;
  color?: "black" | "white" | undefined;
  isLoading?: boolean;
  isSuccess?: boolean;
}

function ShowMoreBtn({
  path = undefined,
  color = undefined,
  children,
  isLoading,
  isSuccess
}: Props) {
  let button = (
    <motion.button
      whileHover={{
        scale: 1.1,
      }}
      transition={{
        delay: 0.3,
        type: "spring",
      }}
      className={`relative btn-effect ${color ? color : "black"}`}
    >
      {children}
    </motion.button>
  );

  if (isLoading || isSuccess) {
    button = (
      <motion.button disabled className={`relative 
      flex justify-center items-center gap-3
      ${color ? color : "black"}`}>
        {isLoading && <Spinner />}
        {isSuccess && <CheckMark />}
        {children}
      </motion.button>
    );
  }

  if (!path) {
    return <div className="show-more-btn">{button}</div>;
  }

  return (
    <Link href={path} className="show-more-btn">
      {button}
    </Link>
  );
}

export default ShowMoreBtn;
