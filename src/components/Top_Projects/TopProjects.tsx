"use client";
import "./index.css";
import { useEffect, useState } from "react";
import { Project } from "../../../types";
import Skeleton from "./Skeleton";
import SingleProject from "./SingleProject";

function TopProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<any>({});
  const [currHover, setCurrHover] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getTopProjects = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/projects/get-top");
        const data = await res.json();

        setProjects(data);
      } catch (err) {
        setError("Error while getting projects!");
      } finally {
        setIsLoading(false);
      }
    };
    getTopProjects();
  }, []);

  useEffect(() => {
    const mouseTracker = document.querySelector(".mouse-tracker-window");

    if (currHover === 0) {
      mouseTracker?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else if (currHover === 1) {
      mouseTracker?.scrollTo({
        top: 190,
        behavior: "smooth",
      });
    } else if (currHover === 2) {
      mouseTracker?.scrollTo({
        top: 400,
        behavior: "smooth",
      });
    }
  }, [currHover]);

  if (error) return <h1 className="error-msg-fetch">{error}</h1>;
  if (isLoading) return <Skeleton />;

  const allProjects = projects.map((proj, index) => (
    <SingleProject
      key={proj.title+"-"+index+"-"+"top-projects"}
      date={proj.date}
      index={index}
      title={proj.title}
      setCurrHover={setCurrHover}
    />
  ));

  const trackMouse  = (e: any) => {
    const { currentTarget } = e;
    const rect = (currentTarget as HTMLElement)?.getBoundingClientRect();
    const x = e.clientX - rect.left + 10;
    const y = e.clientY - rect.top + 10;
    setPositions({ x, y });
  };

  return (
    <div className="top-projects">
      <div className="projects-container"
        onMouseMove={trackMouse}>
        {
          <span
            className="mouse-tracker-window absolute"
            style={{
              transform: `translate(${positions.x}px, ${positions.y}px)`,
            }}
          >
            {projects.map((proj, index) => (
              <img
                src={proj.paths[0]}
                alt={proj.title}
                key={proj.id + "-image-" + index}
              />
            ))}
          </span>
        }

        {allProjects}
      </div>
    </div>
  );
}

export default TopProjects;
