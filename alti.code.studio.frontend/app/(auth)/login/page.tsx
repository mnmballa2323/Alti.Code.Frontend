"use client";

import { Icon } from "@iconify/react";
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

  const handleOAuthLogin = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
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
        <div className="flex flex-col gap-3">
          <div
            className="w-full h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => handleOAuthLogin("github")}
          >
            <div className="flex gap-3 items-center text-black">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span className="font-semibold text-sm">
                Continue with Google
              </span>
            </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" x2="22" y1="2" y2="22"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  )
                }
                name="password"
                placeholder="Enter Password"
                type={isVisible ? "text" : "password"}
                value={passwordValue}
                onValueChange={setPasswordValue}
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
