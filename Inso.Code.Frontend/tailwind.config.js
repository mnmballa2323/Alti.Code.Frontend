const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        default: {
          50: "var(--default-50)",
          100: "var(--default-100)",
          200: "var(--default-200)",
          300: "var(--default-300)",
          400: "var(--default-400)",
          500: "var(--default-500)",
          600: "var(--default-600)",
          700: "var(--default-700)",
          800: "var(--default-800)",
          900: "var(--default-900)",
        },
        content1: "var(--content1)",
        gray: {
          50: "#f1f3f6",
          100: "#e4e7ec",
          200: "#d8dce2",
          300: "#c3c9d2",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      keyframes: {
        "scrolling-banner": {
          from: {transform: "translateX(0)"},
          to: {transform: "translateX(calc(-50% - var(--gap)/2))"},
        },
        "scrolling-banner-vertical": {
          from: {transform: "translateY(0)"},
          to: {transform: "translateY(calc(-50% - var(--gap)/2))"},
        },
      },
      animation: {
        "scrolling-banner": "scrolling-banner var(--duration) linear infinite",
        "scrolling-banner-vertical": "scrolling-banner-vertical var(--duration) linear infinite",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],       
        secondary: ["var(--font-secondary)"],
      },
    },
  },
  darkMode: ["class", ".dark, .midnight-navy"],
  plugins: [heroui()],
};

module.exports = config;
