import "./index.css";
import Image, { StaticImageData } from "next/image";

interface Props {
  width: number;
  height: number;
  path: StaticImageData;
  alt: string;
}

function ImageView({ width, height, path, alt }: Props) {
  return (
    <div className="image-container">
      <Image quality={100} src={path} alt={alt} width={width} height={height} />
    </div>
  );
}

export default ImageView;
