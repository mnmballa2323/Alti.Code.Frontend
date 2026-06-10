"use client";

import { Checkbox, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
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
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
    } finally {
      toast.dismiss(loading);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Welcome back
        </h1>
        <p className="text-center text-gray-500 text-sm mt-2 font-medium">
          Sign in to continue to Inso Code
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
              Login
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 font-medium mt-4">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-black hover:underline transition-all"
            href="/register"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
