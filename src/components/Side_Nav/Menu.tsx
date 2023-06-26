import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const parentVarient = {
  hidden: {
    x: "-1000px",
    borderRadius: "100%",
    opacity: 0,
    transition: {
      duration: 1,
      when: "afterChildren",
      staggerChildren: 0.5
    },
  },
  show: {
    x: "0",
    borderRadius: "0",
    opacity: 1,
    transition: {
      duration: 1,
      when: "beforeChildren",
      staggerChildren: 0.5
    },
  },
};

const linksVarient = {
  hidden: {
    opacity: 0,
    x: -10,
    transition: {
      delay: 0,
    },
  },
  show: {
    opacity: 1,
    x: 0,
  },
};

const layoutVarient ={
  hidden: {
    y: "-50%",
    x: "-300%",
    opacity: 0
  },
  show: {
    y: "-50%",
    x: "-50%",
    opacity: 0.5
  }
}

function Menu({ isOpen }: { isOpen: boolean }) {
  let pathname = usePathname();
  pathname = pathname === "/" ? pathname : `/${pathname.split('/')[1]}`;


  const disableBurgerButton = (e : any) => {
    (document.querySelector(".burger-btn") as HTMLElement)?.click();
  }

  const linksElements = [
    { name: "home", link: "/" },
    { name: "work", link: "/work" },
    { name: "about", link: "/about" },
  ].map((el, k) => (
    <motion.button
      variants={linksVarient}
      key={el.name + "-ver-navbar-link"}
      className={"capitalize w-full " + (pathname === el.link ? "active" : "")}
    >
      <Link href={el.link} className="w-full h-full"
        onClick={disableBurgerButton}
      >
        {el.name}
      </Link>
    </motion.button>
  ));

  return (
    <>
        <motion.nav
          className={`vertical-nav${isOpen ? " active" : ""}`}
          initial="hidden"
          animate={isOpen ? "show" : "hidden"}
          variants={parentVarient}
        >
          {linksElements}
          <span className="small-ball"></span>
        </motion.nav>
      <motion.span 
        initial="hidden"
        animate={isOpen ? "show" : "hidden"}
        variants={layoutVarient}
        transition={{
            type: "tween",
            duration: 1.8
        }}
        className="layout fixed
          sm:hidden
          lg:block
          w-[100vw] h-[101vh] z-[9999998] bg-main-black opacity-40
          left-1/2 top-1/2 overflow-hidden"
      ></motion.span>
    </>
  );
}

export default Menu;
