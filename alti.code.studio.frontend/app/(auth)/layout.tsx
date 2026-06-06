import Link from "next/link";
import { Icon } from "@iconify/react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 z-10 relative">
        {/* Back Button */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors">
            <Icon icon="solar:arrow-left-linear" className="text-lg" />
            Back to Home
          </Link>
        </div>
        
        <div className="w-full max-w-sm mt-12 lg:mt-0">
          {children}
        </div>
      </div>

      {/* Right Background Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#F9FAFB] relative overflow-hidden flex-col justify-end border-l border-gray-100">
         
         {/* Subtle static dot pattern */}
         <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
         
         <div className="relative z-20 p-16 w-full max-w-2xl">
           <h2 className="text-4xl xl:text-5xl font-bold text-black tracking-tight mb-4 leading-tight">
             Build the future.
           </h2>
           <p className="text-gray-600 text-lg xl:text-xl font-medium">
             Join the Alti Code Studio platform and accelerate your engineering team with autonomous AI agents.
           </p>
         </div>
      </div>
    </div>
  );
}
