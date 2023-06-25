"use client";
import SingleLink from "./SingleLink";
import "./index.css";
import { motion } from "framer-motion";

function Footer() {
  const allLinks = [
    {
      name: "linkedin",
      href: "https://www.linkedin.com/in/mostafa-osama-a5b042239/",
    },
    {
      name: "youtube",
      href: "https://www.youtube.com/channel/UCJy35_exYCNLjsNXgh1SMXg",
    },
    { name: "codepen", href: "https://codepen.io/Mostafa-O21" },
    { name: "github", href: "https://github.com/MostafaOS21" },
    {name: "whatsapp", href: "https://wa.me/+201099865475"}
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      transition={{
        staggerChildren: 0.1,
      }}
    >
      {allLinks.map((link) => (
        <SingleLink
          key={link.name + "-footer-link"}
          name={link.name}
          href={link.href}
        />
      ))}
    </motion.footer>
  );
}

export default Footer;
