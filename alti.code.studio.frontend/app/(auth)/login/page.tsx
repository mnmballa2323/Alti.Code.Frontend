"use client";

import { Checkbox, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";
import Link from "next/link";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isLoadingMfa, setIsLoadingMfa] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      setIsDesktopApp(true);
    }
  }, []);

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
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            recaptchaToken,
          }),
        },
      );

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
        if (typeof window !== "undefined" && "__TAURI__" in window) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Login successful!");
          window.location.href = "/";
          return;
        }

        const res = await signIn("credentials", {
          redirect: false,
          accessToken: response.data.accessToken,
        });

        if (res?.error) {
          toast.error(res.error || "Authentication session failed");
        } else if (res?.ok) {
          toast.success("Login successful!");
          router.push("/");
          router.refresh();
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
      const challengeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/challenge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mfaToken,
            code: mfaCode,
          }),
        },
      );

      const response = await challengeRes.json();

      if (!challengeRes.ok || !response.success) {
        toast.error(
          response.message || response.error || "Invalid verification code",
        );

        return;
      }

      if (response.data?.accessToken) {
        if (typeof window !== "undefined" && "__TAURI__" in window) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Verification successful! Logging in...");
          window.location.href = "/";
          return;
        }

        const res = await signIn("credentials", {
          redirect: false,
          accessToken: response.data.accessToken,
        });

        if (res?.error) {
          toast.error(res.error || "Authentication session failed");
        } else if (res?.ok) {
          toast.success("Verification successful! Logging in...");
          router.push("/");
          router.refresh();
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

  if (mfaRequired) {
    return (
      <div className="flex w-full flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F7] text-black shadow-inner">
            <Icon
              className="text-3xl"
              icon="solar:shield-keyhole-bold-duotone"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-black">
              Two-Factor Verification
            </h1>
            <p className="text-center text-gray-500 text-sm mt-2 font-medium max-w-xs">
              Enter the 6-digit verification code from your authenticator app.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <form className="flex flex-col gap-4" onSubmit={handleMfaSubmit}>
            <div className="flex flex-col gap-1.5">
              <Input
                autoFocus
                isRequired
                className="max-w-full text-center"
                classNames={{
                  inputWrapper:
                    "h-14 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus-within:bg-[#EBEBEF] data-[focus=true]:bg-[#EBEBEF] rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
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
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50"
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
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          {isDesktopApp ? "Build the future." : "Welcome back"}
        </h1>
        {isDesktopApp && (
          <p className="text-gray-500 text-sm mt-2 font-medium max-w-xs">
            Login to the inso code platform and 10x your software development with swarms of agents.
          </p>
        )}
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

        {!isDesktopApp && (
          <p className="text-center text-sm text-gray-500 font-medium mt-4">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-black hover:underline transition-all"
              href="/register"
            >
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
