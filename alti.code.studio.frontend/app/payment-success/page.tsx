"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on user role
          const role = (session?.user as any)?.role;
          if (role === "owner") {
            router.push("/owner/dashboard");
          } else if (role === "admin") {
            router.push("/admin/billing");
          } else {
            router.push("/new-chat");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A] px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="relative mx-auto mb-8 w-20 h-20">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full border-2 border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
          Payment Successful
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 dark:text-gray-400 text-base mb-2">
          Your subscription is now active.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
          Welcome to the Alti Code Studio platform.
        </p>

        {/* Sparkle divider */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px w-16 bg-gray-200 dark:bg-gray-800" />
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <div className="h-px w-16 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Auto-redirect notice */}
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
          Redirecting to your dashboard in {countdown}s…
        </p>

        {/* Manual CTA */}
        <button
          onClick={() => {
            const role = (session?.user as any)?.role;
            if (role === "owner") {
              router.push("/owner/dashboard");
            } else if (role === "admin") {
              router.push("/admin/billing");
            } else {
              router.push("/new-chat");
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all duration-300 active:scale-[0.98]"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Session ID for reference */}
        {sessionId && (
          <p className="mt-8 text-gray-300 dark:text-gray-700 text-[10px] font-mono">
            Session: {sessionId.slice(0, 20)}…
          </p>
        )}
      </div>
    </div>
  );
}
