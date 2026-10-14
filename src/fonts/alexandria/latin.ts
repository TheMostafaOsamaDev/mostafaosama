import { Alexandria } from "next/font/google";

const font = Alexandria({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
export const fontVariables = font.variable;
