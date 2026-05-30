"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const MobileNavSheet = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } else if (item.type === "anchor") {
      // Handle anchor links with offset
      const element = document.querySelector(item.href);
      if (element) {
        const offsetTop =
          element.getBoundingClientRect().top + window.pageYOffset - 80; // 80px offset for navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
    // For regular routes, let Next.js Link handle it normally

    setOpen(false);
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="sr-only">
              Are you absolutely sure?
            </SheetTitle>
          </SheetHeader>
          <ul className="font-secondary h-full space-y-8 px-2 font-semibold text-black transition-colors">
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
            {/* <button
              onClick={() => router.push("/code")}
              className="mb-6 font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group cursor-pointer"
            >
              Code Editor
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white transition-all duration-200 group-hover:w-full"></span>
            </button> */}
            <li className="min-xl:gap-6 flex items-center justify-center gap-4">
              <Button
                className="relative rounded-full bg-black px-6 text-white transition-opacity duration-200 hover:opacity-90 dark:bg-black dark:text-white"
                size="sm"
              >
                <Link href="/login">
                  <span className="absolute inset-0 cursor-pointer"></span>
                  Login
                </Link>
              </Button>
              <Button
                className="relative rounded-full bg-black px-6 text-white transition-opacity duration-200 hover:opacity-90 dark:bg-black dark:text-white"
                size="sm"
              >
                <Link href="/register">
                  <span className="absolute inset-0 cursor-pointer"></span>
                  Register
                </Link>
              </Button>
            </li>
          </ul>
          <div className="sticky bottom-10 flex items-center justify-center">
            <Link href="/" className="">
              <Image
                src={theme === "light" ? "/insoBlack.png" : "/insoWhite.png"}
                alt="Logo"
                width={150}
                height={40.11}
                className="w-[180px] h-auto md:w-[200px]"
                priority
              />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavSheet;
