"use client";
import "./index.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skill } from "../../../types";
import SingleSkill from "./SingleSkill";
import Skeleton from "./Skeleton";

function SkillsBox() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const getAllSkills = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/skills");
        const data = await res.json();

        

        setSkills(data);

      } catch(err) {
        setError("Error while getting skills!");
      } finally {
        setIsLoading(false);
      }
    }

    getAllSkills();

  }, []);

  if(error) return <h1 className="error-msg-fetch">{error}</h1>;

  if(isLoading) return <Skeleton />;

  return (
    <motion.div className='skills-grid'
      initial="hidden"
      whileInView="show"
      transition={{
        staggerChildren: 0.4
      }}
    >
      {
        skills.map((skill) => <SingleSkill key={skill.id+"-"+"skills-"+skill.name}
        name={skill.name} path={skill.path} />)
      }
    </motion.div>
  )
}

export default SkillsBox
