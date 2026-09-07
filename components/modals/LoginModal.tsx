"use client";

import { Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";

export function LoginModal() {
  const { isOpen, type, onClose } = useModalStore();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    setIsLoading(true);
    const loading = toast.loading("Sending one-time code...");

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiBaseUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();

      if (!res.ok || !response.success) {
        toast.error(response.message || "Failed to send code.");

        return;
      }

      toast.success("Code sent to your email!");
      setStep("otp");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loading);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6)
      return toast.error("Please enter a valid 6-digit code.");

    setIsLoading(true);
    const loading = toast.loading("Verifying code...");

    try {
      // In a real flow, we would either call NextAuth signIn or hit the backend directly.
      // Since NextAuth credentials provider is already set up to hit the backend, we can use signIn
      // and update the NextAuth credentials provider to accept 'otp' instead of 'password'.
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: otp, // Temporarily passing OTP as password until we update NextAuth
        isOtpFlow: true,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid code.");
      } else if (res?.ok) {
        toast.success("Login successful!");
        onClose();
        window.location.href = "/chat";
      }
    } catch (error) {
      toast.error("Failed to verify code.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loading);
    }
  };

  const resetState = () => {
    setStep("email");
    setEmail("");
    setOtp("");
  };

  return (
    <Dialog
      open={isOpen && type === "login"}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTimeout(resetState, 300);
        }
      }}
    >
      <DialogContent
        hideCloseButton
        className="max-w-md w-full px-4 sm:px-6 py-6 sm:py-8 bg-white dark:bg-[#18181b] border-none shadow-2xl rounded-2xl mx-4 my-auto flex flex-col items-center"
      >
        <DialogTitle className="sr-only" id="login-title">
          Sign In
        </DialogTitle>
        <DialogDescription className="sr-only">
          Sign in to Inso Code
        </DialogDescription>
        <div className="w-full">
          {step === "email" ? (
            <form className="flex flex-col gap-4" onSubmit={handleRequestOtp}>
              <Input
                autoFocus
                isRequired
                classNames={{
                  inputWrapper:
                    "bg-zinc-200 hover:bg-zinc-300 focus-within:!bg-zinc-300 focus-within:!border-transparent border-transparent shadow-none transition-colors duration-200",
                  input:
                    "text-black font-medium placeholder:text-zinc-500 placeholder:font-normal",
                }}
                name="email"
                placeholder="Enter Email Address"
                radius="lg"
                size="lg"
                type="email"
                value={email}
                variant="flat"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full mt-2 h-12 text-sm font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-200"
                disabled={isLoading}
                type="submit"
              >
                Login
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
              <Input
                autoFocus
                isRequired
                classNames={{
                  inputWrapper:
                    "bg-gray-100 dark:bg-gray-800 border-transparent focus-within:border-black dark:focus-within:border-white transition-colors duration-200",
                  input:
                    "text-gray-900 dark:text-white text-center tracking-[0.5em] text-xl font-bold",
                }}
                maxLength={6}
                name="otp"
                placeholder="------"
                radius="lg"
                size="lg"
                type="text"
                value={otp}
                variant="flat"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");

                  setOtp(val);
                }}
              />
              <Button
                className="w-full mt-2 h-12 text-sm font-semibold rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-200"
                disabled={isLoading || otp.length !== 6}
                type="submit"
              >
                Verify & Sign In
              </Button>
              <button
                className="mt-4 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mx-auto"
                type="button"
                onClick={resetState}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
