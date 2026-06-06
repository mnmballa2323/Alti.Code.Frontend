"use client";

import { Icon } from "@iconify/react";
import { Checkbox, Input, Link as HeroLink } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [authStep, setAuthStep] = useState<"options" | "form">("options");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);
  const router = useRouter();

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

    try {
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha("register");
      }
    } catch (err) {
      console.warn("reCAPTCHA bypassed.");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/register`,
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
      router.push("/login");
    } catch (error) {
      toast.dismiss(loading);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleOAuthSignup = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          {authStep === "options" ? "Create an account" : "Register with Email"}
        </h1>
        {authStep === "options" && (
          <p className="text-center text-gray-500 text-sm mt-2 font-medium">
            Join the Alti Code Studio platform.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 mt-2">
        {authStep === "options" ? (
          <div className="flex flex-col gap-3">
            <div
              className="w-full h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
              onClick={() => handleOAuthSignup("github")}
            >
              <div className="flex gap-3 items-center text-black">
                <Icon icon="mdi:github" className="text-xl" />
                <span className="font-semibold text-sm">
                  Sign up with GitHub
                </span>
              </div>
            </div>

            <div
              className="w-full h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
              onClick={() => handleOAuthSignup("google")}
            >
              <div className="flex gap-3 items-center text-black">
                <Icon icon="logos:google-icon" className="text-lg" />
                <span className="font-semibold text-sm">
                  Sign up with Google
                </span>
              </div>
            </div>

            <div className="relative my-4">
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
              onClick={() => setAuthStep("form")}
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                Confirm Password
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
                    onClick={toggleConfirmVisibility}
                  >
                    <Icon
                      className="text-xl text-gray-400"
                      icon={
                        isConfirmVisible
                          ? "solar:eye-closed-linear"
                          : "solar:eye-bold"
                      }
                    />
                  </button>
                }
                name="confirmPassword"
                placeholder="••••••••"
                type={isConfirmVisible ? "text" : "password"}
                variant="flat"
              />
            </div>

            <div className="px-1 mt-1">
              <Checkbox
                isRequired
                classNames={{ label: "text-xs font-medium text-gray-500 leading-tight", wrapper: "before:border-gray-300" }}
                size="sm"
              >
                I agree to the{" "}
                <HeroLink
                  className="text-xs text-black font-semibold hover:underline"
                  href="/terms"
                >
                  Terms
                </HeroLink>
                {" "}and{" "}
                <HeroLink
                  className="text-xs text-black font-semibold hover:underline"
                  href="/privacy-policy"
                >
                  Privacy
                </HeroLink>
              </Checkbox>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md"
                type="submit"
              >
                Create Account
              </Button>
              <Button
                className="w-full h-10 text-gray-500 font-medium hover:text-black hover:bg-transparent"
                variant="ghost"
                onClick={() => setAuthStep("options")}
                type="button"
              >
                Back to options
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 font-medium mt-4">
          Already have an account?{" "}
          <Link
            className="font-semibold text-black hover:underline transition-all"
            href="/login"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
