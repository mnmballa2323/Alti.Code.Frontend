"use client";

import { Input } from "@heroui/react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
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

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Create an account
        </h1>
        <p className="text-center text-gray-500 text-sm mt-2 font-medium">
          Join the Inso Code platform
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Input
              isRequired
              className="max-w-full"
              classNames={{
                inputWrapper:
                  "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
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
                  "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
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

          <div className="flex flex-col gap-1.5">
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "h-12 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input: "text-black font-medium",
              }}
              endContent={
                confirmPasswordValue.length > 0 && (
                  <button
                    className="hover:opacity-70 transition-opacity"
                    type="button"
                    onClick={toggleConfirmVisibility}
                  >
                    {isConfirmVisible ? (
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
              name="confirmPassword"
              placeholder="Confirm Password"
              type={isConfirmVisible ? "text" : "password"}
              value={confirmPasswordValue}
              variant="flat"
              onValueChange={setConfirmPasswordValue}
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              className="w-full h-12 font-semibold bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md"
              type="submit"
            >
              Create Account
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              By registering, you agree to our{" "}
              <Link
                className="font-semibold text-black hover:underline"
                href="/terms"
              >
                Terms of Use
              </Link>{" "}
              &{" "}
              <Link
                className="font-semibold text-black hover:underline"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 font-medium mt-4">
          Already have an account?{" "}
          <Link
            className="font-semibold text-black hover:underline transition-all"
            href="/login"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
