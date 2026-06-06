"use client";

import { Icon } from "@iconify/react";
import { Checkbox, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

import { useModalStore } from "@/store/useModalStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Login() {
  const { onClose, isOpen, onOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [authStep, setAuthStep] = useState<"options" | "email">("options");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

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
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        recaptchaToken,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid credentials");
      } else if (res?.ok) {
        toast.success("Login successful!");
        onClose();
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
    } finally {
      toast.dismiss(loading);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-gray-100 ring-0 outline-none sm:max-w-[400px] bg-white p-0 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-3xl">
        <DialogHeader className="pt-10 px-8">
          <DialogTitle className="text-center text-2xl font-semibold tracking-tight text-black">
            {authStep === "options" ? "Welcome back" : "Sign In"}
          </DialogTitle>
          {authStep === "options" && (
            <p className="text-center text-gray-500 text-sm mt-2 font-medium">
              Sign in to continue to Alti Code Studio.
            </p>
          )}
        </DialogHeader>

        <div className="flex w-full flex-col gap-5 px-8 pb-10 pt-4">
          {authStep === "options" ? (
            <div className="flex flex-col gap-3">
              <div
                className="w-full h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                onClick={() => handleOAuthLogin("github")}
              >
                <div className="flex gap-3 items-center text-black">
                  <Icon icon="mdi:github" className="text-xl" />
                  <span className="font-semibold text-sm">
                    Continue with GitHub
                  </span>
                </div>
              </div>

              <div
                className="w-full h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                onClick={() => handleOAuthLogin("google")}
              >
                <div className="flex gap-3 items-center text-black">
                  <Icon icon="logos:google-icon" className="text-lg" />
                  <span className="font-semibold text-sm">
                    Continue with Google
                  </span>
                </div>
              </div>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">
                    or
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md"
                onClick={() => setAuthStep("email")}
              >
                Continue with Email
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Email
                </label>
                <Input
                  isRequired
                  className="max-w-full"
                  classNames={{
                    inputWrapper:
                      "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] rounded-2xl border-none shadow-none",
                    input: "text-black font-medium",
                  }}
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  variant="flat"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Password
                </label>
                <Input
                  isRequired
                  classNames={{
                    inputWrapper:
                      "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] rounded-2xl border-none shadow-none",
                    input: "text-black font-medium",
                  }}
                  endContent={
                    <button
                      className="hover:opacity-70 transition-opacity"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      <Icon
                        className="text-xl text-gray-400"
                        icon={
                          isVisible
                            ? "solar:eye-closed-linear"
                            : "solar:eye-bold"
                        }
                      />
                    </button>
                  }
                  name="password"
                  placeholder="••••••••"
                  type={isVisible ? "text" : "password"}
                  variant="flat"
                />
              </div>

              <div className="flex w-full items-center justify-between px-1 mt-1">
                <Checkbox
                  defaultSelected
                  classNames={{ label: "text-xs font-medium text-gray-500", wrapper: "before:border-gray-300" }}
                  name="remember"
                  size="sm"
                >
                  Remember me
                </Checkbox>
                <button
                  className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
                  type="button"
                  onClick={() => {
                    /* forgot password */
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  className="w-full h-12 font-semibold bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md"
                  type="submit"
                >
                  Log In
                </Button>
                <Button
                  className="w-full h-10 text-gray-500 font-medium hover:text-black hover:bg-transparent"
                  variant="ghost"
                  onClick={() => setAuthStep("options")}
                >
                  Back to options
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 font-medium mt-2">
            Don&apos;t have an account?{" "}
            <button
              className="font-semibold text-black hover:underline transition-all"
              onClick={() => onOpen({ type: "register" })}
            >
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
