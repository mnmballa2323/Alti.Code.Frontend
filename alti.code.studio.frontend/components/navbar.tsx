"use client";
import { Home, Laptop, Cloud, Network, Lock, Puzzle, Database, Sliders, Cpu, ShieldCheck, Grid, Server, CreditCard, Mail } from "lucide-react";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSession, signOut } from "next-auth/react";

import MobileNavSheet from "./landing-page/MobileNavSheet";

function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      setIsDesktopApp(true);
    }
  }, []);

  const { data: session, status } = useSession();

  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

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
                const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 80;
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
    { name: "Home", icon: Home },
    { name: "Paired Programmer", icon: Laptop },
    { name: "Tri-Cloud", icon: Cloud },
    { name: "Agent Swarm", icon: Network },
    { name: "Enterprise Connectors", icon: Lock },
    { name: "App Connectors", icon: Puzzle },
    { name: "Database Connectors", icon: Database },
    { name: "Deterministic Control", icon: Sliders },
    { name: "Agent Forge", icon: Cpu },
    { name: "Zero Trust Ledger", icon: ShieldCheck },
    { name: "Capabilities Bento Grid", icon: Grid },
    { name: "Enterprise Infrastructure", icon: Server },
    { name: "Pricing", icon: CreditCard },
    { name: "Contact Us", icon: Mail }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined" || window.location.pathname !== "/") return;

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
            const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 80;
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
      const offsetTop = el.getBoundingClientRect().top + window.pageYOffset - 80;
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

  return (
    <>
      <div className="h-[80px] w-full">
        <div className="bg-white dark:bg-black flex items-center justify-between h-[80px] z-[100] fixed top-0 left-0 right-0 w-full transition-all duration-300 border-b border-gray-100 dark:border-gray-800">
          <div className="wrapper relative flex items-center justify-between px-4 md:px-6 lg:px-8 w-full">
            {/* Logo */}
            {mounted ? (
              <Link
                className="flex-shrink-0 flex items-center gap-2 md:gap-3 lg:-translate-x-4"
                href="/"
              >
                {/* Light Mode: Icon + Text */}
                <div className="flex items-center gap-2 md:gap-3 dark:hidden">
                  <Image
                    priority
                    alt="Inso Logo Icon"
                    className="h-8 w-auto object-contain"
                    height={32}
                    src="/assets/logo-icon-black.png?v=2"
                    width={37}
                  />
                  <Image
                    priority
                    alt="Inso Code"
                    className="h-6 w-auto object-contain"
                    height={24}
                    src="/inso-logo-black.png"
                    width={120}
                  />
                </div>
                {/* Dark Mode: Icon + Text */}
                <div className="hidden dark:flex items-center gap-2 md:gap-3">
                  <Image
                    priority
                    alt="Inso Logo Icon"
                    className="h-8 w-auto object-contain"
                    height={32}
                    src="/assets/logo-icon-white.png?v=2"
                    width={37}
                  />
                  <Image
                    priority
                    alt="Inso Code"
                    className="h-6 w-auto object-contain"
                    height={24}
                    src="/inso-logo-white.png"
                    width={120}
                  />
                </div>
              </Link>
            ) : (
              <div
                className="animate-pulse dark:bg-gray-800 bg-gray-200 rounded"
                style={{ width: 160, height: 32 }}
              />
            )}

            {/* Gray Toggle Menu (Centered) */}
            <div className="hidden lg:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1.5 rounded-full shadow-inner">
                {sections.map((sec, index) => {
                  const IconComponent = sec.icon;
                  const isActive = activeSection === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSectionClick(index)}
                      className={`relative group p-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md scale-105"
                          : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <IconComponent className="w-[20px] h-[20px]" />
                      
                      {/* Tooltip */}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-black dark:bg-zinc-950 border border-zinc-700/50 rounded-lg shadow-xl opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        {sec.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ✅ Auth Section Added */}
            <div className="hidden lg:flex gap-4 xl:gap-6 justify-end items-center lg:translate-x-4">
              {session?.user && status === "authenticated" ? (
                <>
                  <Button
                    className="rounded-full border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors px-6"
                    size="sm"
                    onClick={() => router.push("/new-chat")}
                  >
                    Launch App
                  </Button>
                  <Button
                    className="rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 px-6"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className={`rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 ${isDesktopApp ? "w-[160px]" : "px-6"}`}
                    size="sm"
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  {!isDesktopApp && (
                    <Button
                      className="rounded-full dark:bg-white dark:text-black bg-black text-white hover:opacity-90 transition-opacity duration-200 px-6"
                      size="sm"
                      onClick={() => router.push("/register")}
                    >
                      Register
                    </Button>
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
