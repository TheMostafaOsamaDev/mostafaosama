"use client";
import "./index.css";
import PageHeader from "@/components/Page_Header/PageHeader";
import { useEffect, useState } from "react";
import { Project } from "../../../types";
import SkillsTab from "@/components/Work_Page/SkillsTab";
import Warning from "@/components/Icons/Warning";
import SingleProjectBox from "@/components/Work_Page/SingleProjectBox";
import Skeleton from "@/components/Work_Page/Skeleton";
import { AnimatePresence, motion } from "framer-motion";

const mainVarient = {
  hidden: {
    opacity: 0,
    y: 30
  },
  show: {
    opacity: [0, 1],
    y: 0
  }
}

function Work() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAllProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/projects/get-all");
        const data = await res.json();

        if (res.status === 200) {
          setProjects(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        setError("Error while getting projects!");
      } finally {
        setIsLoading(false);
      }
    };

    getAllProjects();
  }, []);

  // Filter Projects With Skills

  const projectElements = projects.map((proj: Project) => {
    if (skills.every((skill) => proj.skills.includes(skill)))
      return <SingleProjectBox proj={proj} key={proj.id} />;
  });

  return (
    <motion.main
      initial="hidden"
      whileInView="show"
      variants={mainVarient}
      >
      <PageHeader>my projects</PageHeader>
      {error && (
        <h1 className="error-msg-fetch mx-auto w-fit text-xl pt-10">
          <Warning /> {error}
        </h1>
      )}

      {!error && (
        <>
          <SkillsTab setSkills={setSkills} choosedSkills={skills} />
          <motion.div
            initial="hidden"
            animate="show"
            className="projects-grid"
            layout
          >
            <AnimatePresence>{!isLoading && projectElements}</AnimatePresence>
            {isLoading && <Skeleton />}
          </motion.div>
        </>
      )}
    </motion.main>
  );
}

export default Work;
