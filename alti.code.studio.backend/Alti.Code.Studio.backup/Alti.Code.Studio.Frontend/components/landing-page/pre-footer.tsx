"use client";
import { setContactModel, setRequestDemoModel } from "@/store/slice";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

function PreFooter() {
  const dispatch = useDispatch();
  const isContactModelOpen = useSelector(
    (state: any) => state.setNewChat.contactModel
  );

  return (
    <div className="w-full bg-black py-10 md:py-16 lg:py-20">
      <div className="wrapper px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 min-h-[240px] ">
          {/* Logo and Tagline Section */}
          <div className="flex flex-col items-between justify-between">
            <div className="flex flex-col gap-6 lg:gap-10 items-center lg:items-start text-center lg:text-left">
              <Image
                src="/insoWhite.png"
                alt="logo image"
                width={150}
                height={40.11}
                className="h-auto w-[150px]"
              />
              <div className="flex flex-col gap-3 lg:gap-5">
                <p className="max-w-[400px] font-normal text-sm md:text-base leading-6 md:leading-8 text-white">
                  10x faster software development 🚀
                </p>
              </div>
            </div>
          </div>
          {/* Navigation Links Section */}
          <div className="w-full lg:w-auto">
            {/* Desktop/Tablet Grid Layout */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-8 max-w-2xl lg:max-w-none mx-auto lg:mx-0">
              {/* Company Column */}
              <div className="flex flex-col gap-6 lg:gap-10 w-full lg:w-[200px]">
                <p className="text-white font-medium text-base">Company</p>
                <ul className="flex flex-col gap-4 lg:gap-6">
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="/"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="#howItsWork"
                    >
                      Product
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="#features"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="#pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors cursor-pointer"
                      href="#"
                      // onClick={() => {
                      //   dispatch(setContactModel(true));
                      // }}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Info Column */}
              <div className="flex flex-col gap-6 lg:gap-10 w-full lg:w-[200px]">
                <p className="text-white font-medium text-base">Info</p>
                <ul className="flex flex-col gap-4 lg:gap-6">
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="/faq"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors cursor-pointer"
                      href="/news"
                      onClick={() => {
                        dispatch(setRequestDemoModel(true));
                      }}
                    >
                      News
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="/"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="/"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-white font-secondary font-normal text-sm hover:text-gray-300 transition-colors"
                      href="/"
                    >
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Office Column */}
              <div className="flex flex-col gap-6 lg:gap-10 w-full lg:w-[200px] col-span-2 md:col-span-1">
                <p className="text-white font-medium text-base">Office</p>
                <ul className="flex flex-col gap-4 lg:gap-6">
                  <li className="text-white font-secondary font-normal text-sm leading-6">
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
                    className="text-white font-secondary font-normal text-sm"
                    href="/"
                  >
                    Home
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="#howItsWork"
                  >
                    Product
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="#security"
                  >
                    Security
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="#pricing"
                  >
                    Pricing
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm cursor-pointer"
                    href="#"
                    onClick={() => dispatch(setContactModel(true))}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base border-b border-gray-600 pb-2">
                  Info
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="/faq"
                  >
                    FAQ
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm cursor-pointer"
                    href="#"
                    onClick={() => dispatch(setRequestDemoModel(true))}
                  >
                    News
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="/"
                  >
                    Privacy
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="/"
                  >
                    Terms
                  </Link>
                  <Link
                    className="text-white font-secondary font-normal text-sm"
                    href="/"
                  >
                    Cookies
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base border-b border-gray-600 pb-2">
                  Office
                </p>
                <p className="text-white font-secondary font-normal text-sm leading-6">
                  575 Market Street
                  <br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
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
          ></div>
          <div className="relative z-[1100] bg-white p-6 md:px-10 md:py-8 rounded-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
            <Icon
              icon="ei:close"
              className="absolute top-3 right-3 dark:text-white text-black cursor-pointer w-5 h-5 hover:scale-110 transition-transform"
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
                  htmlFor="email"
                  className="font-bold text-sm opacity-60 mb-3"
                >
                  Email address
                </label>
                <input
                  className="dark:bg-default-50 bg-default-100 rounded-[12px] py-3 px-5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col mt-4 md:mt-[24px]">
                <label
                  htmlFor="message"
                  className="font-bold text-sm opacity-60 mb-3"
                >
                  Your message
                </label>
                <textarea
                  className="dark:bg-default-50 bg-default-100 rounded-[12px] py-3 px-5 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="message"
                  rows={4}
                  placeholder="Enter your message"
                  draggable="false"
                ></textarea>
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
