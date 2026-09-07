"use client";

import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

import MobileNavSheet from "./landing-page/MobileNavSheet";

import { useModalStore } from "@/store/useModalStore";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";

function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [os, setOs] = useState<"mac" | "win" | "other" | null>(null);
  const { onOpen } = useModalStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();

      if (userAgent.includes("mac")) {
        setOs("mac");
      } else if (userAgent.includes("win")) {
        setOs("win");
      } else {
        setOs("other");
      }
    }
    if (
      typeof window !== "undefined" &&
      ("__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron"))
    ) {
      setIsDesktopApp(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScrollNavbar = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScrollNavbar(); // Check scroll position immediately on mount

    window.addEventListener("scroll", handleScrollNavbar);

    return () => window.removeEventListener("scroll", handleScrollNavbar);
  }, []);

  const { data: session, status } = useSession();

  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const profileFromStore = useAppSelector((state) => state.user.data);
  const profile = profileFromStore?.email ? profileFromStore : null;

  const [activeSection, setActiveSection] = useState(-1);

  useEffect(() => {
    if (pathname === "/contact") {
      setActiveSection(13);
    } else if (pathname === "/") {
      if (typeof window !== "undefined") {
        const targetStr = sessionStorage.getItem("scrollTargetSection");

        if (targetStr) {
          const index = parseInt(targetStr, 10);

          sessionStorage.removeItem("scrollTargetSection");
          if (!isNaN(index)) {
            setTimeout(() => {
              const el = document.getElementById(`section-${index}`);

              if (el) {
                const offsetTop =
                  el.getBoundingClientRect().top + window.pageYOffset - 80;

                window.scrollTo({
                  top: offsetTop,
                  behavior: "smooth",
                });
                setActiveSection(index);
              }
            }, 200);

            return;
          }
        }
      }

      const handleInitialSync = () => {
        const scrollPosition = window.scrollY + 120;
        let found = false;

        for (let i = 0; i <= 12; i++) {
          const el = document.getElementById(`section-${i}`);

          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;

            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(i);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          setActiveSection(0);
        }
      };

      // Wait for mount/render to sync
      setTimeout(handleInitialSync, 100);
    } else {
      setActiveSection(-1);
    }
  }, [pathname]);

  const sections = [
    { name: "Demo", id: "demo", href: "/demo" },
    { name: "Pricing", id: "pricing", href: "/pricing" },
    {
      name: "Download",
      id: "download",
      href:
        os === "mac"
          ? "/download/mac"
          : os === "win"
            ? "/download/windows"
            : "/download",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined" || window.location.pathname !== "/")
        return;

      const scrollPosition = window.scrollY + 120;

      for (let i = 0; i <= 12; i++) {
        const el = document.getElementById(`section-${i}`);

        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;

    if (hash && hash.startsWith("#section-")) {
      const index = parseInt(hash.replace("#section-", ""), 10);

      if (!isNaN(index)) {
        setTimeout(() => {
          const el = document.getElementById(`section-${index}`);

          if (el) {
            const offsetTop =
              el.getBoundingClientRect().top + window.pageYOffset - 80;

            window.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
            setActiveSection(index);
          }
        }, 300);
      }
    }
  }, []);

  const handleTextClick = (sec: any) => {
    if (sec.href && sec.href !== "/") {
      router.push(sec.href);

      return;
    }

    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      sessionStorage.setItem("scrollTargetSectionId", sec.id);
      router.push("/");

      return;
    }

    const el = document.getElementById(sec.id);

    if (el) {
      const offsetTop =
        el.getBoundingClientRect().top + window.pageYOffset - 80;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const handleSectionClick = (index: number) => {
    if (index === 13) {
      router.push("/contact");

      return;
    }

    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      sessionStorage.setItem("scrollTargetSection", String(index));
      router.push("/");

      return;
    }

    setActiveSection(index);

    const el = document.getElementById(`section-${index}`);

    if (el) {
      const offsetTop =
        el.getBoundingClientRect().top + window.pageYOffset - 80;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
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

  // Use isTransparent for styling to ensure solid background on non-home pages
  const isLandingPage = [
    "/",
    "/pricing",
    "/demo",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/clouds/azure",
  ].includes(pathname);

  const isTransparent = isLandingPage && !isScrolled;

  return (
    <>
      {!isLandingPage && <div className="h-[80px] w-full" />}
      <div
        className={cn(
          "flex items-center justify-between h-[80px] z-[100] fixed top-0 left-0 right-0 w-full transition-all duration-300",
          !isTransparent
            ? isLandingPage
              ? "bg-black border-none"
              : "bg-zinc-100 border-b border-zinc-200 shadow-sm"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="wrapper relative flex items-center justify-between px-4 md:px-6 lg:px-8 w-full">
          {/* Logo */}
          <Link
            className="flex-shrink-0 flex items-center gap-2 md:gap-3 lg:-translate-x-4"
            href="/"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Image
                priority
                alt="Inso Logo Icon"
                className="h-6 w-auto object-contain transition-all duration-300"
                height={24}
                src="/logo-white.png"
                width={28}
              />
              <Image
                priority
                alt="Inso Code"
                className="h-6 w-auto object-contain transition-all duration-300"
                height={24}
                src="/inso-logo-white.png"
                width={120}
              />
            </div>
          </Link>

          {/* Text Nav Menu (Centered) */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {sections.map((sec: any, index: number) =>
              sec.dropdown ? (
                <div key={index} className="relative group">
                  <button className="text-[13px] font-normal text-white/80 hover:text-white transition-colors duration-200 py-4 flex items-center gap-1">
                    {sec.name}
                  </button>
                  <div className="absolute top-[80%] left-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-1 -translate-y-2 transition-all duration-200 z-50 min-w-[150px]">
                    <div className="flex flex-col gap-3 py-2">
                      {sec.dropdown.map((item: any, i: number) => (
                        <Link
                          key={i}
                          className="text-[13px] font-normal text-white/80 hover:text-white transition-colors whitespace-nowrap text-left"
                          href={item.href}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : sec.href && sec.href !== "/" ? (
                <Link
                  key={index}
                  className="text-[13px] font-normal text-white/80 hover:text-white transition-colors duration-200"
                  href={sec.href}
                >
                  {sec.name}
                </Link>
              ) : (
                <button
                  key={index}
                  className="text-[13px] font-normal text-white/80 hover:text-white transition-colors duration-200"
                  onClick={() => handleTextClick(sec)}
                >
                  {sec.name}
                </button>
              ),
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex gap-8 xl:gap-12 justify-end items-center lg:translate-x-4">
            {mounted && session?.user && status === "authenticated" ? (
              <>
                <Button
                  className={cn(
                    "rounded-full px-6 transition-all duration-200 shadow-sm border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-200 micro-beam-btn",
                  )}
                  size="sm"
                  onClick={() => {
                    router.push("/chat");
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  className={cn(
                    "rounded-full px-6 transition-all duration-200 shadow-sm bg-black text-white hover:bg-zinc-800 micro-beam-btn",
                  )}
                  size="sm"
                  onClick={() => {
                    useModalStore.getState().onOpen({ type: "logout" });
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <button
                  className="text-[13px] font-normal text-white/80 hover:text-white transition-colors"
                  onClick={() => onOpen({ type: "login" })}
                >
                  Login
                </button>
                {!isDesktopApp && (
                  <button
                    className="text-[13px] font-normal text-white/80 hover:text-white transition-colors"
                    onClick={() => onOpen({ type: "register" })}
                  >
                    Register
                  </button>
                )}
              </>
            )}
          </div>

          <div className="lg:hidden">
            <MobileNavSheet />
          </div>

          {/* Mobile Hamburger Menu */}
          {/* <div className="lg:hidden flex items-center gap-4">
            <Button
              onClick={() => router.push("/login")}
              className="rounded-full dark:bg-white dark:text-black bg-zinc-50 shadow-sm border border-zinc-200 text-zinc-900 text-xs px-4 py-2"
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
              className="fixed inset-0 bg-zinc-50 shadow-sm border border-zinc-200/50 backdrop-blur-sm z-40 lg:hidden"
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
                    className="w-full rounded-full dark:bg-white dark:text-black bg-zinc-50 shadow-sm border border-zinc-200 text-zinc-900 hover:opacity-90 transition-opacity duration-200"
                  >
                    {" "}
                    Get Started{" "}
                  </Button>{" "}
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {" "}
                    Already have an account?{" "}
                    <button
                      onClick={() => handleAuthClick("/login")}
                      className="text-black dark:text-zinc-900 font-medium hover:underline"
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
