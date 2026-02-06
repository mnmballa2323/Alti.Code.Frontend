"use client";
import { setContactModel } from "@/store/slice";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import MobileNavSheet from "./landing-page/MobileNavSheet";
import { useSession, signOut } from "next-auth/react";

function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session, status } = useSession();
  console.log(session, "check session");
  console.log(status, "check status");

  const { theme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const links = [
    { href: "/", label: "Home", type: "route" },
    { href: "#howItsWork", label: "Product", type: "anchor" },
    { href: "#security", label: "Features", type: "anchor" },
    { href: "#pricing", label: "Pricing", type: "anchor" },
    { href: "#", label: "Contact", type: "action" },
  ];

  // Handle drawer close when clicking on links
  const handleLinkClick = (item: any) => {
    if (item.label === "Contact" || item.type === "action") {
      dispatch(setContactModel(true));
    } else if (item.type === "anchor") {
      // Handle anchor links with offset
      const element = document.querySelector(item.href);
      if (element) {
        const offsetTop =
          element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }

    setIsDrawerOpen(false);
  };

  // Handle button clicks in drawer
  const handleAuthClick = (path: any) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // Animation variants
  const drawerVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  const linkVariants = {
    closed: {
      x: 50,
      opacity: 0,
    },
    open: (i: any) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    }),
  };

  const buttonVariants = {
    closed: {
      y: 50,
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.6,
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  return (
    <>
      <div className="flex items-center justify-between h-[80px] z-50 sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="wrapper flex items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          {mounted ? (
            <Link href="/" className="flex-shrink-0">
              <Image
                src={theme === "light" ? "/insoBlack.png" : "/insoWhite.png"}
                alt="Logo"
                width={150}
                height={40.11}
                className="h-auto w-[150px]"
                priority
              />
            </Link>
          ) : (
            <div
              className="animate-pulse dark:bg-gray-800 bg-gray-200 rounded"
              style={{ width: 100, height: 40.11 }}
            />
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-12">
            <ul className="flex items-center gap-8 xl:gap-12">
              {links.map((item, index) => (
                <li key={index}>
                  {item.type === "anchor" ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(item);
                      }}
                      className="font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white transition-all duration-200 group-hover:w-full"></span>
                    </button>
                  ) : (
                    <Link
                      onClick={() => handleLinkClick(item)}
                      className="font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group"
                      href={item.href}
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {/* <button
              onClick={() => router.push("/code")}
              className="font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group cursor-pointer"
            >
              Code Editor
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white transition-all duration-200 group-hover:w-full"></span>
            </button> */}

            {/* ✅ Auth Section Added */}
            <div className="flex gap-4 xl:gap-6 justify-center items-center">
              {(session?.user && status === 'authenticated') ? (
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 px-6"
                  size="sm"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    className="rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 px-6"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push("/register")}
                    className="rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 px-6"
                    size="sm"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <MobileNavSheet />
          </div>

          {/* Mobile Hamburger Menu */}
          {/* <div className="lg:hidden flex items-center gap-4">
            <Button
              onClick={() => router.push("/login")}
              className="rounded-full dark:bg-white dark:text-black bg-black text-white text-xs px-4 py-2"
              size="sm"
            >
              Login
            </Button>
            <motion.button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <Icon
                icon="lucide:menu"
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
              />
            </motion.button>
          </div> */}
        </div>
      </div>

      {/* Mobile Drawer */}
     {/*  <AnimatePresence>
        {" "}
        {isDrawerOpen && (
          <>
            {" "}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />{" "}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={drawerVariants}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden"
            >
              {" "}
              <div className="flex flex-col h-full">
                {" "}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    {mounted && (
                      <Image
                        src={
                          theme === "light" ? "/logo.png" : "/logo_white.png"
                        }
                        alt="Logo"
                        width={80}
                        height={32}
                        className="w-[60px] h-auto"
                      />
                    )}{" "}
                  </div>{" "}
                  <motion.button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    {" "}
                    <Icon
                      icon="lucide:x"
                      className="w-6 h-6 text-gray-700 dark:text-gray-300"
                    />{" "}
                  </motion.button>{" "}
                </div>{" "}
                <div className="flex-1 overflow-y-auto py-6">
                  {" "}
                  <nav className="px-6">
                    {" "}
                    <ul className="space-y-2">
                      {" "}
                      {links.map((item, index) => (
                        <motion.li
                          key={index}
                          custom={index}
                          initial="closed"
                          animate="open"
                          variants={linkVariants}
                        >
                          {" "}
                          <Link
                            onClick={() => handleLinkClick(item)}
                            href={item.href}
                            className="flex items-center py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium group"
                          >
                            {" "}
                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                              {" "}
                              {item.label}{" "}
                            </span>{" "}
                            <Icon
                              icon="lucide:chevron-right"
                              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />{" "}
                          </Link>{" "}
                        </motion.li>
                      ))}{" "}
                    </ul>{" "}
                  </nav>{" "}
                </div>{" "}
                <motion.div
                  initial="closed"
                  animate="open"
                  variants={buttonVariants}
                  className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3"
                >
                  {" "}
                  <Button
                    onClick={() => handleAuthClick("/register")}
                    className="w-full rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200"
                  >
                    {" "}
                    Get Started{" "}
                  </Button>{" "}
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {" "}
                    Already have an account?{" "}
                    <button
                      onClick={() => handleAuthClick("/login")}
                      className="text-black dark:text-white font-medium hover:underline"
                    >
                      {" "}
                      Sign in{" "}
                    </button>{" "}
                  </p>{" "}
                </motion.div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </>
        )}{" "}
      </AnimatePresence> */}
    </>
  );
}

export default Navbar;
