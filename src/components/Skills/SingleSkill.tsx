"use client";
import Image from 'next/image';
import {motion} from "framer-motion";

interface Skill {
  name: string;
  path: string;
}

let skillVarient = {
  hidden: {
    y: 20,
    opacity: 0,
    filter: `blur(10px)`
  },
  show: {
    y: 0,
    opacity: 1,
    filter: `blur(0px)`,
  }
}

function SingleSkill({name, path} : Skill) {
  return (
    <motion.div  className='box'
      variants={skillVarient}
    >
      <div className="skill-logo skill">
        <Image src={path} alt={name} width={100} height={100} />
      </div>
      {name}
    </motion.div>
  )
}

export default SingleSkill
