import HeaderSquares from "./HeaderSquares";
import "./index.css";
import { Bitter } from "next/font/google";


const header_font = Bitter({
  weight: ['400', '700'],
  subsets: ['cyrillic']
})

interface Props {
  children: string;
}



function PageHeader({children} : Props) {
  return (
    <h1 className={"page-header " + header_font.className}>
      <HeaderSquares />
      {children.split(' ').join('.')}
    </h1>
  )
}

export default PageHeader
