"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

function SuccessCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState("Initializing platform session...");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken") || searchParams.get("token");

    if (!accessToken) {
      setStatus("error");
      setStatusMessage("Missing authentication token. Please log in again.");
      toast.error("Authentication token not found.");
      return;
    }

    const performSignIn = async () => {
      try {
        setStatusMessage("Establishing secure credentials session...");
        const result = await signIn("credentials", {
          redirect: false,
          accessToken,
        });

        if (result?.error) {
          setStatus("error");
          setStatusMessage(result.error || "Failed to establish platform session.");
          toast.error("Session establishment failed.");
        } else if (result?.ok) {
          setStatus("success");
          setStatusMessage("Platform session initialized successfully. Redirecting...");
          toast.success("Signed in successfully!");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        setStatus("error");
        setStatusMessage("An unexpected error occurred during SSO validation.");
        toast.error("SSO authorization failed.");
      }
    };

    performSignIn();
  }, [searchParams, router]);

  return (
    <div className="flex w-full flex-col gap-6 items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            <p className="text-sm text-gray-500 font-medium animate-pulse">{statusMessage}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-bounce">
              <Icon icon="lucide:check-circle" className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-semibold text-emerald-600">Access Granted</h1>
            <p className="text-sm text-gray-500 font-medium px-4">{statusMessage}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 text-center w-full max-w-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 shadow-md">
              <Icon icon="lucide:x-circle" className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-semibold text-red-600">SSO Verification Failed</h1>
            <p className="text-sm text-gray-500 font-medium px-4">{statusMessage}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2 bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform font-medium shadow-md w-full cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col gap-4 items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">
            Loading success redirect...
          </p>
        </div>
      }
    >
      <SuccessCallbackContent />
    </Suspense>
  );
}
