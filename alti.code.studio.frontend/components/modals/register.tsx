"use client";

import { Icon } from "@iconify/react";
import { Checkbox, Input, Link } from "@heroui/react";
import { signIn } from "next-auth/react";
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

export function Register() {
  const { onClose, isOpen, onOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [authStep, setAuthStep] = useState<"options" | "form">("options");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    const loading = toast.loading("Creating account...");

    let recaptchaToken = "frontend-recaptcha-token-placeholder";

    if (executeRecaptcha) {
      recaptchaToken = await executeRecaptcha("register");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          recaptchaToken,
        }),
      },
    );

    toast.dismiss(loading);

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || data.error || "Registration failed");

      return;
    }

    toast.success(data?.message || "Account created successfully!");
    onClose();
  };

  const handleOAuthSignup = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-none ring-0 outline-none sm:max-w-[440px] bg-white dark:bg-black p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="pt-8 px-8">
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            {authStep === "options" ? "Register" : "Register with email"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-6 px-8 pb-10 pt-4">
          {authStep === "options" ? (
            <div className="flex flex-col gap-3">
              <Button
                className="w-full h-12 font-medium border-default-200 hover:bg-default-100 transition-all flex gap-3 items-center justify-center rounded-xl"
                variant="outline"
                onClick={() => handleOAuthSignup("github")}
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign up with GitHub
              </Button>

              <Button
                className="w-full h-12 font-medium border-default-200 hover:bg-default-100 transition-all flex gap-3 items-center justify-center rounded-xl"
                variant="outline"
                onClick={() => handleOAuthSignup("google")}
              >
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
                Sign up with Google
              </Button>

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
                onClick={() => setAuthStep("form")}
              >
                Continue with Email
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <Input
                isRequired
                classNames={{
                  inputWrapper: "h-12 border-default-200 rounded-xl",
                  label: "font-semibold text-foreground mb-1",
                }}
                label="Email"
                labelPlacement="outside"
                name="email"
                placeholder="Enter your email"
                type="email"
                variant="bordered"
              />

              <Input
                isRequired
                classNames={{
                  inputWrapper: "h-12 border-default-200 rounded-xl",
                  label: "font-semibold text-foreground mb-1",
                }}
                endContent={
                  <button type="button" onClick={toggleVisibility}>
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon={
                        isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"
                      }
                    />
                  </button>
                }
                label="Password"
                labelPlacement="outside"
                name="password"
                placeholder="Enter your password"
                type={isVisible ? "text" : "password"}
                variant="bordered"
              />

              <Input
                isRequired
                classNames={{
                  inputWrapper: "h-12 border-default-200 rounded-xl",
                  label: "font-semibold text-foreground mb-1",
                }}
                endContent={
                  <button type="button" onClick={toggleConfirmVisibility}>
                    <Icon
                      className="pointer-events-none text-2xl text-default-400"
                      icon={
                        isConfirmVisible
                          ? "solar:eye-closed-linear"
                          : "solar:eye-bold"
                      }
                    />
                  </button>
                }
                label="Confirm Password"
                labelPlacement="outside"
                name="confirmPassword"
                placeholder="Confirm your password"
                type={isConfirmVisible ? "text" : "password"}
                variant="bordered"
              />

              <Checkbox
                isRequired
                className="py-2"
                classNames={{ label: "text-xs" }}
                size="sm"
              >
                I agree with the&nbsp;
                <Link
                  className="text-xs text-default-500 underline"
                  href="/terms"
                >
                  Terms
                </Link>
                &nbsp;and&nbsp;
                <Link
                  className="text-xs text-default-500 underline"
                  href="/privacy-policy"
                >
                  Privacy
                </Link>
              </Checkbox>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full h-12 font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl"
                  type="submit"
                >
                  Create Account
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
            Already have an account?{" "}
            <button
              className="font-bold text-foreground hover:underline transition-all"
              onClick={() => onOpen({ type: "login" })}
            >
              Log in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
