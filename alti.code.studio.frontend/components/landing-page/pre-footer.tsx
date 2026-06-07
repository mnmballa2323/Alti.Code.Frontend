"use client";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { setContactModel, setRequestDemoModel } from "@/store/slice";

function PreFooter() {
  const dispatch = useDispatch();
  const isContactModelOpen = useSelector(
    (state: any) => state.setNewChat.contactModel,
  );

  return (
    <div className="w-full bg-black py-6 md:py-8 lg:py-10 border-t border-white/5">
      <div className="wrapper px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
          {/* Logo and Tagline Section */}
          <div className="flex flex-col items-between justify-between">
            <div className="flex flex-col gap-4 items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center gap-3">
                <Image
                  alt="Inso Logo Icon"
                  className="h-8 w-auto object-contain"
                  height={32}
                  src="/logo-white.png"
                  width={37}
                />
                <Image
                  alt="Inso Code"
                  className="h-6 w-auto object-contain"
                  height={24}
                  src="/inso-logo-white.png"
                  width={120}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="max-w-[400px] font-normal text-sm md:text-base leading-6 md:leading-8 text-neutral-400">
                  Secure local swarms with cloud orchestration. Engineered for absolute speed and precision.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links Section */}
          <div className="w-full lg:w-auto">
            {/* Desktop/Tablet Grid Layout */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16 max-w-2xl lg:max-w-none mx-auto lg:mx-0">
              {/* Company Column */}
              <div className="flex flex-col gap-3 lg:gap-4 w-full lg:w-[150px]">
                <p className="text-white font-medium text-base">Company</p>
                <ul className="flex flex-col gap-2 lg:gap-3">
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="/"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="#howItsWork"
                    >
                      Product
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="#security"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="#pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Platform Column */}
              <div className="flex flex-col gap-3 lg:gap-4 w-full lg:w-[150px]">
                <p className="text-white font-medium text-base">Platform</p>
                <ul className="flex flex-col gap-2 lg:gap-3">
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="/mission-control"
                    >
                      Mission Control
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="/marketplace"
                    >
                      Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors"
                      href="/news"
                    >
                      Changelog
                    </Link>
                  </li>
                  <li>
                    <button
                      className="text-neutral-400 font-secondary font-normal text-sm hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-left align-baseline"
                      onClick={() => {
                        dispatch(setContactModel(true));
                      }}
                    >
                      Contact Sales
                    </button>
                  </li>
                </ul>
              </div>

              {/* Office Column */}
              <div className="flex flex-col gap-3 lg:gap-4 w-full lg:w-[200px]">
                <p className="text-white font-medium text-base">Office</p>
                <ul className="flex flex-col gap-2 lg:gap-3 text-neutral-400 font-secondary font-normal text-sm leading-relaxed">
                  <li>
                    575 Market Street
                    <br />
                    San Francisco, CA 94105
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Accordion-style Layout */}
            <div className="sm:hidden flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base border-b border-gray-600 pb-2">
                  Company
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="/"
                  >
                    Home
                  </Link>
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="#howItsWork"
                  >
                    Product
                  </Link>
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="#security"
                  >
                    Features
                  </Link>
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="#pricing"
                  >
                    Pricing
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base border-b border-gray-600 pb-2">
                  Platform
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="/mission-control"
                  >
                    Mission Control
                  </Link>
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="/marketplace"
                  >
                    Marketplace
                  </Link>
                  <Link
                    className="text-neutral-400 font-secondary font-normal text-sm"
                    href="/news"
                  >
                    Changelog
                  </Link>
                  <button
                    className="text-neutral-400 font-secondary font-normal text-sm text-left bg-transparent border-0 p-0"
                    onClick={() => dispatch(setContactModel(true))}
                  >
                    Contact Sales
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base border-b border-gray-600 pb-2">
                  Office
                </p>
                <div className="flex flex-col gap-2 text-neutral-400 font-secondary font-normal text-sm leading-6">
                  <p>
                    575 Market Street
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and social media bar */}
        <div className="border-t border-neutral-900 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>© {new Date().getFullYear()} Inso Code Technologies, Inc.</span>
            <span className="hidden md:inline text-neutral-800">|</span>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/" className="hover:text-white transition-colors">Cookies Policy</Link>
            </div>
          </div>
          <div className="flex gap-4 text-lg">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Icon icon="ri:github-fill" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Icon icon="ri:twitter-x-fill" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Icon icon="ri:discord-fill" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Icon icon="ri:linkedin-box-fill" />
            </a>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isContactModelOpen && (
        <div className="fixed inset-0 top-0 md:top-[80px] w-screen h-screen md:h-[calc(100vh-80px)] flex justify-center items-center z-[1000] p-4">
          <div
            className="fixed inset-0 top-0 md:top-[80px] w-screen h-screen md:h-[calc(100vh-80px)] bg-black/50 z-[1001]"
            onClick={() => {
              dispatch(setContactModel(false));
            }}
          />
          <div className="relative z-[1100] bg-white p-6 md:px-10 md:py-8 rounded-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <Icon
              className="absolute top-3 right-3 dark:text-white text-black cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
              icon="ei:close"
              onClick={() => {
                dispatch(setContactModel(false));
              }}
            />
            <h2 className="text-2xl md:text-[40px] font-bold font-secondary mb-6">
              Get in touch
            </h2>
            <div className="w-full">
              <div className="flex flex-col mt-4 md:mt-[25px]">
                <label
                  className="font-bold text-sm opacity-60 mb-3"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  className="dark:bg-default-50 bg-default-100 rounded-[12px] py-3 px-5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <div className="flex flex-col mt-4 md:mt-[24px]">
                <label
                  className="font-bold text-sm opacity-60 mb-3"
                  htmlFor="message"
                >
                  Your message
                </label>
                <textarea
                  className="dark:bg-default-50 bg-default-100 rounded-[12px] py-3 px-5 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  draggable="false"
                  id="message"
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>
              <Button
                className="dark:bg-white dark:text-black bg-black text-white w-full py-3 md:py-4 px-6 rounded-full font-bold text-sm md:text-base font-secondary mt-4 md:mt-6 hover:opacity-90 transition-opacity"
                onClick={() => {
                  dispatch(setContactModel(false));
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreFooter;
