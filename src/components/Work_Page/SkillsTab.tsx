"use client";
import "./index.css";
import { Dispatch, SetStateAction, MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cross from "../Icons/Cross";

interface Props {
  setSkills: Dispatch<SetStateAction<string[]>>;
  choosedSkills: string[];
}

function SkillsTab({ setSkills, choosedSkills }: Props) {
  const skills = [
    "SASS",
    "MVC",
    "React.js",
    "Next.js",
    "Node.js",
    "MongoDB",
    "Express",
    "Vanilla JS",
    "API",
    "Bootstrap",
  ];

  const handleSkillsClick = (e: MouseEvent<HTMLDivElement>) => {
    const { currentTarget: el } = e;
    el.classList.toggle("active");
    if (el.classList.contains("active")) {
      setSkills((curr) => [...curr, el.textContent as string]);
    } else {
      setSkills((curr) => curr.filter((val) => val !== el.textContent));
    }
  };
  const removeAllSkills = (e: MouseEvent<HTMLDivElement>) => {
    const allSkills = document.querySelectorAll(".skills-tab .skill");

    // Remove Active Class
    allSkills.forEach((skill) => {
      if (skill.classList.contains("active")) {
        skill.classList.remove("active");
      }
    });

    // Empty Skills State
    setSkills([]);
  };

  const allSkills = skills.map((skill) => (
    <motion.div
      className="skill"
      key={skill + "-" + "filter"}
      onClick={handleSkillsClick}
      initial={{
        scale: 1,
      }}
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.9,
      }}
    >
      {skill}
    </motion.div>
  ));

  return (
    <motion.div className="skills-tab">
      {allSkills}
      <AnimatePresence>
        {choosedSkills.length > 0 && (
          <motion.div
            onClick={removeAllSkills}
            initial={{
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.9,
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            className="clear-all"
          >
            <Cross /> clear
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default SkillsTab;
