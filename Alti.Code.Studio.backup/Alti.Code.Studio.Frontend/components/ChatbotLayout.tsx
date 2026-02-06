"use client";

import Sidebar from "@/components/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChatBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // useEffect(() => {
  //   // Auto logout if session expired or unauthenticated
  //   if (status === "unauthenticated") {
  //     signOut({ callbackUrl: "/login" });
  //   }
  // }, [status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="flex justify-center items-center">
          <img
            className="h-16 w-16"
            src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif"
            alt=""
          />
        </div>
        <div className="flex justify-center items-center mt-2">
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render your ChatBot layout
  // if (status === "authenticated") {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto scroll-smooth scrollbar-none">
        {children}
      </div>
    </div>
  );
  // }
}
