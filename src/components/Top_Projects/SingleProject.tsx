"use client";

import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface Project {
  title: string;
  date: string;
  index: number;
  setCurrHover: Dispatch<SetStateAction<number | undefined>>;
}

function SingleProject({ setCurrHover, title, date, index }: Project) {
  const handleMouseEnter = (e: any, index: number) => setCurrHover(index);

  return (
    <Link
      href={`/work/${title.split(" ").join("-").toLowerCase()}`}
      onMouseEnter={(e) => handleMouseEnter(e, index)}
    >
      <h3>{title.length > 15 ? title.slice(0, 16) + "..." : title}</h3>
      <p>{date}</p>
    </Link>
  );
}

export default SingleProject;
