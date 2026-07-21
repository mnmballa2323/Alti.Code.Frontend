import Image from "next/image";
import React from "react";

function SecondSection() {
  const items = [
    {
      title: "Built for Developers",
      des: "Works with your codebase, tools, and workflows with no extra setup required.",
      img: "/assets/shield.svg",
    },
    {
      title: "Smarter with Context",
      des: "The platform uses your own data to keep every line of code accurate and project specific.",
      img: "/assets/svgs/brain.svg",
    },
    {
      title: "Integrated Apps",
      des: "Connect to 600+ apps through one streamlined and unified server connection.",
      img: "/assets/svgs/enterprise.svg",
    },
  ];

  return (
    <div className="wrapper flex flex-col justify-center items-center py-20">
      <div className="flex flex-col gap-5">
        <h2 className="font-secondary text-[#fff] font-bold text-5xl leading-[56px] text-center">
          Why Choose Inso Code
        </h2>
        <p className="font-normal text-lg leading-[24px] text-center text-[#fff]">
          The complete AI coding solution built for speed, accuracy, and
          control.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-16 px-8 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full flex bg-opacity-60 items-center p-10 justify-center flex-col gap-8 rounded-[20px] dark:bg-default-50 bg-default-100"
          >
            <div className="w-20 h-20 dark:bg-white bg-black flex justify-center items-center rounded-full">
              <Image
                alt="shied icon"
                className=""
                height={index === 0 || index === 1 ? 50 : 40}
                src={item.img}
                width={index === 0 || index === 1 ? 50 : 40}
              />
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
              <p className="font-medium text-base">{item.title}</p>
              <p className="font-normal text-sm leading-[24px] opacity-60 text-center">
                {item.des}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecondSection;
