"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgImage = pathname === "/register" ? "/assets/auth/register_bg.png" : "/assets/auth/login_bg.png";

  return (
    <div className="flex min-h-screen bg-white font-sans flex-col-reverse lg:flex-row">
      
      {/* Left Panel: Background Images */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-end border-r border-gray-900">
         <div className="absolute inset-0 z-0">
           <img 
             src={bgImage} 
             alt="Inso Code Auth Background" 
             className="absolute inset-0 w-full h-full object-cover" 
           />
         </div>
         
         {/* Logo */}
         <div className="absolute top-8 left-12 z-30 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
           <Link href="/">
             <img src="/inso-logo-white.png" alt="Inso Logo" className="h-8 w-auto" />
           </Link>
         </div>
         
         {/* Gradient Overlay to make text readable */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
         
         <div className="relative z-20 p-16 w-full max-w-2xl">
           <h2 className="text-4xl xl:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
             Build the future.
           </h2>
           <p className="text-gray-300 text-lg xl:text-xl font-medium">
             Join the Inso Code platform and accelerate your engineering team with autonomous AI agents.
           </p>
         </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 z-10 relative">
        {/* Back Button */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors">
            <Icon icon="solar:arrow-left-linear" className="text-lg" />
            Back to Home
          </Link>
        </div>
        
        <div className="w-full max-w-sm mt-20 lg:mt-12">
          {children}
        </div>
      </div>

    </div>
  );
}
