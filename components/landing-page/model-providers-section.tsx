"use client";

import React from "react";
import { Icon } from "@iconify/react";

const providers = [
  {
    id: "gemini",
    name: "Gemini",
    icon: "custom:gemini",
    rgb: "26, 115, 232",
    color: "#1A73E8",
  },
  {
    id: "claude",
    name: "Claude",
    icon: "logos:claude-icon",
    rgb: "217, 119, 6",
    color: "#D97706",
  },
  {
    id: "grok",
    name: "Grok",
    icon: "custom:xai",
    rgb: "113, 113, 122",
    color: "#71717A",
    isMonochrome: true,
  },
  {
    id: "llama",
    name: "Llama",
    icon: "simple-icons:meta",
    rgb: "6, 104, 225",
    color: "#0668E1",
    isMonochrome: true,
  },
];

export default function ModelProvidersSection() {
  return (
    <section className="w-full py-16 bg-white dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-none transition-colors duration-300 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-10 items-center text-center relative z-10">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black dark:text-white">
            Sovereign Intelligence Engines
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-3xl mx-auto">
            To guarantee absolute data sovereignty and compliance, the platform
            is <br className="hidden md:inline" /> powered exclusively by
            premier models hosted securely on Google Cloud Vertex AI and Gemini
            Foundation Models.
          </p>
        </div>

        {/* Static Grid Container */}
        <div className="w-full max-w-5xl px-4 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
            {providers.map((provider, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
                style={
                  {
                    "--accent-color": provider.color,
                    "--accent-rgb": provider.rgb,
                    borderColor: provider.color,
                    boxShadow: `0 4px 20px rgba(${provider.rgb}, 0.15)`,
                  } as React.CSSProperties
                }
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-300">
                  {provider.icon === "custom:gemini" ? (
                    <svg
                      className="w-5 h-5 object-contain"
                      fill="none"
                      height="20"
                      viewBox="0 0 65 65"
                      width="20"
                    >
                      <mask
                        height="65"
                        id="gemini-mask"
                        maskUnits="userSpaceOnUse"
                        style={{ maskType: "alpha" }}
                        width="65"
                        x="0"
                        y="0"
                      >
                        <path
                          d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
                          fill="#000"
                        />
                        <path
                          d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
                          fill="url(#gemini-paint-linear)"
                        />
                      </mask>
                      <g mask="url(#gemini-mask)">
                        <g filter="url(#gemini-filter-0)">
                          <path
                            d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z"
                            fill="#FFE432"
                          />
                        </g>
                        <g filter="url(#gemini-filter-1)">
                          <path
                            d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z"
                            fill="#FC413D"
                          />
                        </g>
                        <g filter="url(#gemini-filter-2)">
                          <path
                            d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z"
                            fill="#00B95C"
                          />
                        </g>
                        <g filter="url(#gemini-filter-3)">
                          <path
                            d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z"
                            fill="#00B95C"
                          />
                        </g>
                        <g filter="url(#gemini-filter-4)">
                          <path
                            d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z"
                            fill="#00B95C"
                          />
                        </g>
                        <g filter="url(#gemini-filter-5)">
                          <path
                            d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z"
                            fill="#3186FF"
                          />
                        </g>
                        <g filter="url(#gemini-filter-6)">
                          <path
                            d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z"
                            fill="#FBBC04"
                          />
                        </g>
                        <g filter="url(#gemini-filter-7)">
                          <path
                            d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z"
                            fill="#3186FF"
                          />
                        </g>
                        <g filter="url(#gemini-filter-8)">
                          <path
                            d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z"
                            fill="#749BFF"
                          />
                        </g>
                        <g filter="url(#gemini-filter-9)">
                          <path
                            d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z"
                            fill="#FC413D"
                          />
                        </g>
                        <g filter="url(#gemini-filter-10)">
                          <path
                            d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z"
                            fill="#FFEE48"
                          />
                        </g>
                      </g>
                      <defs>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="43.217"
                          id="gemini-filter-0"
                          width="39.274"
                          x="-19.824"
                          y="13.152"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="2.46"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="85.688"
                          id="gemini-filter-1"
                          width="84.868"
                          x="-15.001"
                          y="-40.257"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="11.891"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="90.916"
                          id="gemini-filter-2"
                          width="79.454"
                          x="-20.776"
                          y="11.927"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="10.109"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="90.916"
                          id="gemini-filter-3"
                          width="79.454"
                          x="-20.776"
                          y="11.927"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="10.109"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="81.505"
                          id="gemini-filter-4"
                          width="79.731"
                          x="-19.845"
                          y="15.459"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="10.109"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="73.758"
                          id="gemini-filter-5"
                          width="75.117"
                          x="29.832"
                          y="-11.552"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="9.606"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="78.758"
                          id="gemini-filter-6"
                          width="78.135"
                          x="-38.583"
                          y="-16.253"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="8.706"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="77.539"
                          id="gemini-filter-7"
                          width="78.877"
                          x="8.107"
                          y="-5.966"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="7.775"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="51.81"
                          id="gemini-filter-8"
                          width="56.272"
                          x="13.587"
                          y="-18.488"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="6.957"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="69.306"
                          id="gemini-filter-9"
                          width="70.856"
                          x="-15.526"
                          y="-31.297"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="5.876"
                          />
                        </filter>
                        <filter
                          colorInterpolationFilters="sRGB"
                          filterUnits="userSpaceOnUse"
                          height="51.571"
                          id="gemini-filter-10"
                          width="55.501"
                          x="-14.168"
                          y="20.964"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="BackgroundImageFix"
                            result="shape"
                          />
                          <feGaussianBlur
                            result="effect1_foregroundBlur"
                            stdDeviation="7.273"
                          />
                        </filter>
                        <linearGradient
                          gradientUnits="userSpaceOnUse"
                          id="gemini-paint-linear"
                          x1="18.447"
                          x2="52.153"
                          y1="43.42"
                          y2="15.004"
                        >
                          <stop stopColor="#4893FC" />
                          <stop offset=".27" stopColor="#4893FC" />
                          <stop offset=".777" stopColor="#969DFF" />
                          <stop offset="1" stopColor="#BD99FE" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : provider.icon === "custom:xai" ? (
                    <img
                      alt="xAI"
                      className="w-5 h-5 object-contain dark:invert"
                      src="/images/providers/xai_official.png"
                    />
                  ) : (
                    <Icon
                      className="w-5 h-5 object-contain"
                      icon={provider.icon}
                      style={
                        provider.isMonochrome
                          ? { color: provider.color }
                          : undefined
                      }
                    />
                  )}
                </div>
                <span className="text-[13px] sm:text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors whitespace-nowrap">
                  {provider.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
