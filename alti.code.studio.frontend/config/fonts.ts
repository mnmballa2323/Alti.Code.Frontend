import { Poppins, DM_Sans, Instrument_Serif } from "next/font/google";

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

export const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

