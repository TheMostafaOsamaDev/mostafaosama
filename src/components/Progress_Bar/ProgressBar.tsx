'use client';
import Spinner from "../Icons/Spinner";
import "./index.css";
import { useEffect, useState } from "react";

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {
      setProgress((prevProg => prevProg >= 100 ? 0 : prevProg + 10));
    }, 600);


    return () => clearInterval(interval);
  }, []);

  console.log(progress);

  return (
    <div className="progress-bar">
      <div className={`bar`} style={{
        width: `${progress}%`
      }}></div>
      <Spinner />
    </div>
  )
}

export default ProgressBar
