"use client";

import { Checkbox, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/useModalStore";

export function LoginModal() {
  const { isOpen, onClose } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isLoadingMfa, setIsLoadingMfa] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loading = toast.loading("Logging in...");
    let recaptchaToken = "frontend-recaptcha-token-placeholder";

    try {
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("login");
      }
    } catch (e) {
      console.warn("reCAPTCHA failed or invalid dummy key, bypassing...");
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const loginRes = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          recaptchaToken,
        }),
      });

      const response = await loginRes.json();

      if (!loginRes.ok || !response.success) {
        toast.error(
          response.message || response.error || "Invalid credentials",
        );
        return;
      }

      if (response.data?.mfaRequired) {
        setMfaToken(response.data.mfaToken);
        setMfaRequired(true);
        toast.success("MFA verification code required.");
        return;
      }

      if (response.data?.accessToken) {
        // Check if we are running in the Tauri desktop app
        if (typeof window !== "undefined" && "__TAURI__" in window) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Login successful!");
          onClose();
          window.location.href = "/";
          return;
        }

        // Standard web login using NextAuth
        const res = await signIn("credentials", {
          redirect: false,
          accessToken: response.data.accessToken,
        });

        if (res?.error) {
          toast.error(res.error || "Authentication session failed");
        } else if (res?.ok) {
          toast.success("Login successful!");
          onClose();
          window.location.href = "/";
        }
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
    } finally {
      toast.dismiss(loading);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mfaCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    const loading = toast.loading("Verifying code...");
    setIsLoadingMfa(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const challengeRes = await fetch(`${apiBaseUrl}/auth/mfa/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mfaToken,
          code: mfaCode,
        }),
      });

      const response = await challengeRes.json();

      if (!challengeRes.ok || !response.success) {
        toast.error(
          response.message || response.error || "Invalid verification code",
        );
        return;
      }

      if (response.data?.accessToken) {
        // Check if we are running in the Tauri desktop app
        if (typeof window !== "undefined" && "__TAURI__" in window) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Verification successful! Logging in...");
          onClose();
          window.location.href = "/";
          return;
        }

        // Standard web login using NextAuth
        const res = await signIn("credentials", {
          redirect: false,
          accessToken: response.data.accessToken,
        });

        if (res?.error) {
          toast.error(res.error || "Authentication session failed");
        } else if (res?.ok) {
          toast.success("Verification successful! Logging in...");
          onClose();
          window.location.href = "/";
        }
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during MFA verification.");
    } finally {
      setIsLoadingMfa(false);
      toast.dismiss(loading);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setMfaRequired(false);
    setMfaToken("");
    setMfaCode("");
    setPasswordValue("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[420px] bg-white text-black rounded-3xl p-6 md:p-8 shadow-2xl">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-2xl font-bold tracking-tight text-center text-black">
            {mfaRequired ? "Two-Factor Verification" : "Sign In"}
          </DialogTitle>
          <p className="text-center text-gray-500 text-xs mt-1 font-medium max-w-xs">
            {mfaRequired
              ? "Enter the 6-digit verification code from your authenticator app."
              : "Sign in to continue using Inso Code Desktop"}
          </p>
        </DialogHeader>

        {mfaRequired ? (
          <div className="flex flex-col gap-5 mt-4">
            <form className="flex flex-col gap-4" onSubmit={handleMfaSubmit}>
              <div className="flex flex-col gap-1.5">
                <Input
                  autoFocus
                  isRequired
                  className="max-w-full text-center"
                  classNames={{
                    inputWrapper:
                      "h-14 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none",
                    input:
                      "text-center font-mono text-2xl tracking-[0.5em] pl-[0.25em] text-black font-semibold",
                  }}
                  name="mfaCode"
                  placeholder="000000"
                  type="text"
                  value={mfaCode}
                  onValueChange={(val) => {
                    const digitsOnly = val.replace(/\D/g, "");
                    if (digitsOnly.length <= 6) {
                      setMfaCode(digitsOnly);
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  className="w-full h-12 font-semibold bg-black hover:bg-zinc-800 text-white rounded-2xl transition-all shadow-md disabled:opacity-50"
                  disabled={mfaCode.length !== 6 || isLoadingMfa}
                  type="submit"
                >
                  Verify & Sign In
                </Button>
              </div>
            </form>

            <button
              className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center justify-center gap-1.5 mt-2 mx-auto"
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setMfaToken("");
                setMfaCode("");
              }}
            >
              <Icon className="text-base" icon="solar:arrow-left-linear" />
              Back to login
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mt-4">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <Input
                  isRequired
                  className="max-w-full"
                  classNames={{
                    inputWrapper:
                      "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none",
                    input: "text-black font-medium",
                  }}
                  name="email"
                  placeholder="Enter Email"
                  type="email"
                  variant="flat"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Input
                  isRequired
                  classNames={{
                    inputWrapper:
                      "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none",
                    input: "text-black font-medium",
                  }}
                  endContent={
                    passwordValue.length > 0 && (
                      <button
                        className="hover:opacity-70 transition-opacity"
                        type="button"
                        onClick={toggleVisibility}
                      >
                        {isVisible ? (
                          <svg
                            className="text-gray-400"
                            fill="none"
                            height="20"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" x2="22" y1="2" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            className="text-gray-400"
                            fill="none"
                            height="20"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    )
                  }
                  name="password"
                  placeholder="Enter Password"
                  type={isVisible ? "text" : "password"}
                  value={passwordValue}
                  variant="flat"
                  onValueChange={setPasswordValue}
                />
              </div>

              <div className="flex w-full items-center justify-between px-1 mt-1">
                <Checkbox
                  defaultSelected
                  classNames={{
                    label: "text-xs font-medium text-gray-500",
                    wrapper: "before:border-gray-300",
                  }}
                  name="remember"
                  size="sm"
                >
                  Remember me
                </Checkbox>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  className="w-full h-12 font-semibold bg-black hover:bg-zinc-800 text-white rounded-2xl transition-all shadow-md"
                  type="submit"
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
