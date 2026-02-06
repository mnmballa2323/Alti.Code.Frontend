import { Poppins, DM_Sans } from "next/font/google";
import path from "path";

export const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const fontSecondary = DM_Sans({
  subsets: ["latin"],
  variable: "--font-secondary",
  weight: ["400", "500", "700"],
});
// export const fontThinker = Thinker({
//   subsets: ["latin"],
//   variable: "--font-thinker",
//   path: path.join(process.cwd(), "../"),
//   display: "swap",
//   weight: ["400", "500", "700"],
// });
