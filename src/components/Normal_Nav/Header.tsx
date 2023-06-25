"use client";
import "./index.css";
import Link from 'next/link'
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabsVarient = {
  hidden: {
    y: '300px'
  },

  visible: {
    y: '0',
  }
}

function Header() {
  const pathname = usePathname().split("/")[1];
  

  return (
    <header className='capitalize w-full
    text-lg sticky font-medium'>
      <motion.div 
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.5
        }}
        className="links-container"
      >
        <Link href="/" className={pathname==="" ? "active" : ""}>
          <motion.button className='capitalize' variants={tabsVarient}>home</motion.button>
        </Link>
        <Link href="/work" className={pathname==="work" ? "active" : ""}>
          <motion.button className='capitalize' variants={tabsVarient}>work</motion.button>
        </Link>
        <Link href="/about" className={pathname==="about" ? "active" : ""}>
          <motion.button className='capitalize' variants={tabsVarient}>about</motion.button>
        </Link>
        <motion.span className='small-ball'
          initial={{
            opacity: 0,
          }}

          animate={{
            opacity: 1,
          }}

          transition={{
            delay: 0.5
          }}
        ></motion.span>
      </motion.div>
    </header>
  )
}

export default Header
