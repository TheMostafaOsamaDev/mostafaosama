import "./index.css";
import { Project } from "../../../types";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  proj: Project;
}

const projectVarient = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
  }
};

function SingleProjectBox({ proj }: Props) {
  return (
    <motion.div variants={projectVarient} exit={{ opacity: 0}}
    layout className="project-container">
      <Link
        className="project"
        href={"/work/" + proj.title.split(" ").join("-").toLowerCase()}
      >
        <div className="proj-image-container">
          <img src={proj.paths[0]} alt={proj.title} />
        </div>
        <h3>{proj.title}</h3>
        <p>
          {proj.desc.length > 60 ? proj.desc.slice(0, 60) + "..." : proj.desc}
        </p>
        <div className="made-with">
          {proj.skills.slice(0, 3).map((skill) => (
            <span key={"proj-skills-" + skill}>{skill}</span>
          ))}
          {proj.skills.length > 3 && <span key={"proj-skills-more"}>...</span>}
        </div>
      </Link>
    </motion.div>
  );
}

export default SingleProjectBox;
