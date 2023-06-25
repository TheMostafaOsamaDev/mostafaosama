"use client";

import { useEffect, useState } from "react";
import { Project } from "../../../../types";
import SingleProjectPage from "@/components/Work_Page/SingleProjectPage/SingleProjectPage";
import Skeleton from "@/components/Work_Page/SingleProjectPage/Skeleton";
import Warning from "@/components/Icons/Warning";

function OnlySingleProject({ params }: { params: { title: string } }) {
  const [project, setProject] = useState<Project>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const projectTitle = params.title;

  useEffect(() => {

    const getSingleProject = async () => {

      try {
        setIsLoading(true);
        const res = await fetch(`/api/projects/${projectTitle}`);
        const data = await res.json();

        if(res.status === 200) {
          setProject(data);
        } else if(res.status === 404){
          throw new Error("Project can't be found!");
        } else {
          throw new Error("Error Ocurred, please check connection!");
        }
      

      } catch(err : any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }

    }

    getSingleProject();

  }, []);


  return (
      <div className="single-proj-container
        py-28
        flex flex-col items-center divide-y gap-[40px]">
          {error && <h1 className="error-msg-fetch h-[100vh]"><Warning/> {error}</h1>}
        { !isLoading && <SingleProjectPage proj={project as Project} /> }
        { isLoading && <Skeleton /> }
      </div>
  )
}

export default OnlySingleProject
