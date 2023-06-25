"use client";
import "./index.css";
import { Project } from "../../../../types";
import Slider from "./Slider";
import Paragraph from "@/components/Paragraph/Paragraph";
import GitHub from "@/components/Icons/GitHub";
import ExternalLink from "@/components/Icons/ExternalLink";

interface Props {
  proj: Project;
}

function SingleProjectPage({ proj }: Props) {
  console.log("project: ", proj);

  if (!proj) return;

  return (
    <>
      <h3 className="text-2xl capitalize relative w-fit
      before:absolute before:w-[70%] before:h-[2px]
      before:bg-main-color before:-bottom-3
      before:left-1/2 before:-translate-x-1/2 mx-auto mb-16">{proj.title}</h3>

      <span className="project-date">{proj.date}</span>

      <Slider title={proj.title} paths={proj.paths} />

      <div className="skills-made-with capitalize">
        <h3>skills:</h3>
        <ul>
          {
            proj.skills.map((skill) => <li key={"single-proj-skill-"+skill}>{skill}</li>)
          }
        </ul>
      </div>

      <p className="project-desc">
        {proj.desc}
      </p>

      <div className="ext-links-container">
        <a href={proj.repo} target="_blank"><GitHub /> repo</a>
        <a href={proj.liveDemo} target="_blank"><ExternalLink /> live demo</a>
      </div>
    </>
  );
}

export default SingleProjectPage;
