"use client";

import React from "react";
import { Icon } from "@iconify/react";

const languages = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "logos:javascript",
    rgb: "247, 223, 30",
    color: "#F7DF1E",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "logos:typescript-icon",
    rgb: "49, 120, 198",
    color: "#3178C6",
  },
  {
    id: "python",
    name: "Python",
    icon: "logos:python",
    rgb: "55, 118, 171",
    color: "#3776AB",
  },
  {
    id: "java",
    name: "Java",
    icon: "logos:java",
    rgb: "244, 67, 54",
    color: "#F44336",
  },
  {
    id: "cpp",
    name: "C++",
    icon: "logos:c-plusplus",
    rgb: "0, 89, 156",
    color: "#00599C",
  },
  {
    id: "csharp",
    name: "C#",
    icon: "logos:c-sharp",
    rgb: "161, 121, 242",
    color: "#A179F2",
  },
  {
    id: "golang",
    name: "Go",
    icon: "logos:go",
    rgb: "0, 173, 216",
    color: "#00ADD8",
  },
  {
    id: "c",
    name: "C",
    icon: "logos:c",
    rgb: "168, 185, 204",
    color: "#A8B9CC",
  },
  {
    id: "php",
    name: "PHP",
    icon: "logos:php",
    rgb: "119, 123, 180",
    color: "#777BB4",
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "logos:ruby",
    rgb: "204, 52, 45",
    color: "#CC342D",
  },
  {
    id: "swift",
    name: "Swift",
    icon: "logos:swift",
    rgb: "250, 115, 67",
    color: "#FA7343",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    icon: "logos:kotlin-icon",
    rgb: "127, 82, 255",
    color: "#7F52FF",
  },
  {
    id: "sql",
    name: "SQL",
    icon: "vscode-icons:file-type-sql",
    rgb: "227, 139, 0",
    color: "#E38B00",
  },
  {
    id: "bash",
    name: "Bash",
    icon: "logos:bash-icon",
    rgb: "78, 170, 37",
    color: "#4EAA25",
  },
  {
    id: "rust",
    name: "Rust",
    icon: "logos:rust",
    rgb: "229, 115, 36",
    color: "#E57324",
  },
];

// Duplicate the array 3 times to make sure it covers wide screens without gaps
const marqueeLanguages = [...languages, ...languages, ...languages];

export default function LanguagesScrollingBanner() {
  return (
    <section className="w-full py-16 bg-white dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-none transition-colors duration-300 overflow-hidden relative">
      {/* Soft background grid lines or subtle glow */}
      <div className="absolute inset-0 moving-grid-bg opacity-[0.05] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 items-center text-center relative z-10">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black dark:text-white">
            Universal Language Roster
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto">
            Supporting the core 15 languages that represent 98%+ of production
            codebases, tooling pipelines, and enterprise deployments globally.
          </p>
        </div>

        {/* Marquee Infinite Loop Container */}
        <div className="relative w-full overflow-hidden py-4 select-none">
          {/* Fade mask overlay on left & right margins */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-[#030303] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-[#030303] to-transparent pointer-events-none z-20" />

          {/* Marquee Animations */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes scroll-languages {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-33.3333%); }
                }
                .animate-scroll-languages {
                  animation: scroll-languages 30s linear infinite;
                  width: max-content;
                }
              `,
            }}
          />

          <div className="flex animate-scroll-languages hover:[animation-play-state:paused] gap-6 px-4">
            {marqueeLanguages.map((lang, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] whitespace-nowrap group hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={
                  {
                    /* Custom styling tags passed to handle dynamic hover glows */
                    "--accent-color": lang.color,
                    "--accent-rgb": lang.rgb,
                  } as React.CSSProperties
                }
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform duration-300">
                  <Icon className="w-5 h-5 object-contain" icon={lang.icon} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                  {lang.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
