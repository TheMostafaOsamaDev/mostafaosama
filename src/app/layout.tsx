import Footer from "@/components/Footer/Footer";
import "./globals.css";
import MainNavbar from "@/components/MainNavbar";
import { IBM_Plex_Sans } from "next/font/google";

const main_font = IBM_Plex_Sans({
  weight: ["400", "700"],
  subsets: ["cyrillic"],
});

export const metadata = {
  title: "Mostafa Osama",
  description:
    "I am driven by the thrill of seeking new challenges in web development. I dive into uncharted territories to expand my skills and embrace emerging technologies. Embracing challenges fuels my growth, enabling me to deliver innovative solutions that exceed expectations. I thrive in dynamic environments, leveraging my expertise to overcome obstacles and create remarkable digital experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/icon.png" sizes="any" />
      <body
        className={main_font.className + " relative"}
        suppressHydrationWarning={true}
      >
        <MainNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
