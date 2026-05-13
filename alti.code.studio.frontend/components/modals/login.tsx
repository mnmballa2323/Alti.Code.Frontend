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
        // Force a router refresh to update session state
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
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[440px] bg-white dark:bg-black p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="pt-8 px-8">
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            {authStep === "options" ? "Login" : "Login with email"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6 px-8 pb-10 pt-4">
          {authStep === "options" ? (
            <div className="flex flex-col gap-3">
              <div className="w-full flex flex-col gap-3 justify-center">
                <div
                  className="w-full h-12 rounded-xl overflow-hidden flex items-center justify-center border border-default-200 hover:bg-default-100 transition-all cursor-pointer"
                  onClick={() => handleOAuthLogin("github")}
                >
                  <div className="flex gap-3 items-center">
                    <svg
                      className="size-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span className="font-medium text-sm">
                      Sign in with GitHub
                    </span>
                  </div>
                </div>

                <div
                  className="w-full h-12 rounded-xl overflow-hidden flex items-center justify-center border border-default-200 hover:bg-default-100 transition-all cursor-pointer"
                  onClick={() => handleOAuthLogin("google")}
                >
                  <div className="flex gap-3 items-center">
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="font-medium text-sm">
                      Sign in with Google
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-default-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-2 text-default-400">
                    or
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-12 font-medium bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-opacity"
                onClick={() => setAuthStep("email")}
              >
                Continue with Email
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Email
                </label>
                <Input
                  isRequired
                  className="max-w-full"
                  classNames={{
                    inputWrapper:
                      "h-12 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 focus-within:bg-gray-100 dark:focus-within:bg-zinc-900 rounded-xl",
                  }}
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  variant="flat"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <Input
                  isRequired
                  classNames={{
                    inputWrapper:
                      "h-12 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 focus-within:bg-gray-100 dark:focus-within:bg-zinc-900 rounded-xl",
                  }}
                  endContent={
                    <button
                      className="hover:opacity-70 transition-opacity"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      <Icon
                        className="text-2xl text-default-400"
                        icon={
                          isVisible
                            ? "solar:eye-closed-linear"
                            : "solar:eye-bold"
                        }
                      />
                    </button>
                  }
                  name="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  variant="flat"
                />
              </div>

              <div className="flex w-full items-center justify-between">
                <Checkbox
                  defaultSelected
                  classNames={{ label: "text-xs text-default-500" }}
                  name="remember"
                  size="sm"
                >
                  Remember me
                </Checkbox>
                <button
                  className="text-xs text-default-500 hover:underline transition-all"
                  type="button"
                  onClick={() => {
                    /* forgot password */
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full h-12 font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl"
                  type="submit"
                >
                  Log In
                </Button>
                <Button
                  className="w-full h-10 text-default-500 font-medium"
                  variant="ghost"
                  onClick={() => setAuthStep("options")}
                >
                  Back to options
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-default-500">
            Don&apos;t have an account?{" "}
            <button
              className="font-bold text-foreground hover:underline transition-all"
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
