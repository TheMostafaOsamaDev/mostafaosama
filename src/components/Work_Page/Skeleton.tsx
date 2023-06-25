import "./index.css";

function Skeleton() {
  const skeletonsArr = new Array(8);

  for (let i = 0; i < skeletonsArr.length; i++) {
    skeletonsArr[i] = (
      <div className="project-container skeleton" key={"all-projects-skeletons-"+i}>
        <div className="project">
          <div className="proj-image-container"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
    );
  }

  return <>{skeletonsArr}</>;
}

export default Skeleton;
