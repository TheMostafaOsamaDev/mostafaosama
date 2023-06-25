"use client";
import Styles from "../styles.module.css";
import ImageView from "@/components/Image_View/ImageView";
import PageHeader from "@/components/Page_Header/PageHeader";
import React from "react";
import about2 from "@/assets/about-2.jpg";
import about3 from "@/assets/about-3.jpg";
import about4 from "@/assets/my_image.jpg";
import Paragraph from "@/components/Paragraph/Paragraph";
import { motion } from "framer-motion";
import ShowMoreBtn from "@/components/ShowMoreBtn/ShowMoreBtn";

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

function About() {
  return (
    <motion.main
      initial="hidden"
      whileInView="show"
      variants={mainVarient}
      className={Styles.main}>
      <PageHeader>about me</PageHeader>
      <div className="">
        <ImageView width={300} height={400} path={about2} alt="Mostafa Osama" />
        <Paragraph>
          My name is Mostafa Osama, and I am a web developer with over 2 years
          of experience. I possess a strong and in-depth understanding of
          various web technologies. Throughout my career, I have honed my skills
          in creating dynamic and engaging web applications. I am passionate
          about staying up-to-date with the latest trends and advancements in
          the industry, ensuring that my work reflects the best practices and
          delivers exceptional user experiences.
        </Paragraph>
      </div>
      <div className="sm:flex-col-reverse lg:flex-row">
        <Paragraph>
          I attended the Faculty of Computer Science in Beni Suef, Egypt, where
          I gained a strong understanding of programming, algorithms, and
          software development. My academic background equipped me with the
          skills needed to excel in web development and confidently tackle
          complex technical challenges
        </Paragraph>
        <ImageView width={300} height={400} path={about3} alt="Mostafa Osama" />
      </div>
      <div>
        <ImageView width={320} height={500} path={about4} alt="Mostafa Osama" />
        <Paragraph>
          I am driven by the thrill of seeking new challenges in web
          development. I dive into
          uncharted territories to expand my skills and embrace emerging
          technologies. Embracing challenges fuels my growth, enabling me to
          deliver innovative solutions that exceed expectations. I thrive in
          dynamic environments, leveraging my expertise to overcome obstacles
          and create remarkable digital experiences.
        </Paragraph>
      </div>

      <ShowMoreBtn path="/work">see my projects</ShowMoreBtn>
    </motion.main>
  );
}

export default About;
