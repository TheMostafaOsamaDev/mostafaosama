import GridSquares from "@/components/Grid_Squares/GridSquares";
import ImageView from "@/components/Image_View/ImageView";
import MyImage from "@/components/My_Image/MyImage";
import SubHeader from "@/components/Sub_Header/SubHeader";
import about1 from "@/assets/about-1.jpg";
import Paragraph from "@/components/Paragraph/Paragraph";
import ShowMoreBtn from "@/components/ShowMoreBtn/ShowMoreBtn";
import TopProjects from "@/components/Top_Projects/TopProjects";
import SkillsBox from "@/components/Skills/SkillsBox";
import GetInTouch from "@/components/Get_In_Touch/GetInTouch";

export default function Home() {


  return (
    <>
      <main
        className="grid items-center relative
    h-[100vh] overflow-hidden"
      >
        <GridSquares />
        <div
          className="flex items-center absolute gap-20 left-[50%]
      -translate-x-1/2"
        >
          <MyImage />
        </div>
      </main>

      <section className="about-me sub-section grid" id="about-me">
        <SubHeader keyVal={"about-me-sub-header"}>about me</SubHeader>
        <div className="content flex flex-wrap items-center justify-center gap-12">
          <ImageView
            path={about1}
            alt={"About Mostafa Osama 1"}
            width={330}
            height={550}
          />
          <Paragraph>
            My name is Mostafa Osama, and I am from Egypt. I have studied
            Computer Science and Artificial Intelligence at BNS University. I
            have a passion for web development and I am actively seeking
            challenging opportunities in this field.
          </Paragraph>
        </div>
        <ShowMoreBtn path="/about">show more</ShowMoreBtn>
      </section>
      <section className="latest-projects sub-section">
        <SubHeader keyVal="latest-projects">top projects</SubHeader>
        <TopProjects />
        <ShowMoreBtn path="/work">more projects</ShowMoreBtn>
      </section>
      <section className="skills sub-section">
        <SubHeader keyVal="skills">skills</SubHeader>
        <SkillsBox />
      </section>
      <section className="get-in-touch sub-section">
        <SubHeader keyVal="get-in-touch">get in touch</SubHeader>
        <GetInTouch />
      </section>
    </>
  );
}
