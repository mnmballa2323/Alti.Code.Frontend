"use client";

import { Checkbox, Input } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const router = useRouter();

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isLoadingMfa, setIsLoadingMfa] = useState(false);

  // Forgot password state
  // step: 'login' | 'forgot' | 'reset'
  const [authStep, setAuthStep] = useState<'login' | 'forgot' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        "__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        "electron" in window ||
        window.navigator.userAgent.includes("Electron")
      );
    }

    return false;
  });

  useEffect(() => {
    // Keep empty useEffect to satisfy any linter rules, or just remove it if unused
  }, []);

  // ── Forgot password: request OTP ────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsLoadingForgot(true);
    const loading = toast.loading("Sending reset code...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forget-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to send reset code");
        return;
      }
      toast.success("If that email is registered, a code was sent.");
      setAuthStep('reset');
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoadingForgot(false);
      toast.dismiss(loading);
    }
  };

  // ── Reset password: submit OTP + new password ───────────────────────────────
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resetOtp.length !== 6) {
      toast.error("Please enter the 6-digit code from your email.");
      return;
    }
    if (newPasswordValue.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsLoadingReset(true);
    const loading = toast.loading("Resetting password...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.trim(),
            otp: resetOtp,
            newPassword: newPasswordValue,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to reset password");
        return;
      }
      toast.success("Password updated! Please sign in.");
      setAuthStep('login');
      setForgotEmail("");
      setResetOtp("");
      setNewPasswordValue("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoadingReset(false);
      toast.dismiss(loading);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loading = toast.loading("Logging in...");

    try {
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
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
        const isTauri =
          typeof window !== "undefined" &&
          ("__TAURI__" in window ||
            "electron" in window ||
            window.navigator.userAgent.includes("Electron"));

        if (isTauri) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
        }

        if (isTauri && process.env.NODE_ENV === "production") {
          toast.success("Login successful!");
          window.location.href = "/new-chat";

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
          if (isTauri) {
            window.location.href = "/new-chat";
          } else {
            router.push("/admin");
            router.refresh();
          }
        }
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error: any) {
      console.error("Login fetch error:", error);
      toast.error(
        `Login error: ${error.message || String(error)} | URL: ${process.env.NEXT_PUBLIC_API_URL}`,
      );
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
        if (
          process.env.NODE_ENV === "production" &&
          typeof window !== "undefined" &&
          ("__TAURI__" in window ||
            "electron" in window ||
            window.navigator.userAgent.includes("Electron"))
        ) {
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("accessToken", response.data.accessToken);
          toast.success("Verification successful! Logging in...");
          window.location.href = "/new-chat";

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
          router.push("/admin");
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

  // ── Forgot Password Step ────────────────────────────────────────────────────
  if (authStep === 'forgot') {
    return (
      <div className="flex w-full flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F7] text-black shadow-inner">
            <Icon className="text-3xl" icon="solar:lock-keyhole-bold-duotone" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-black">Reset Password</h1>
            <p className="text-center text-gray-500 text-sm mt-2 font-medium max-w-xs">
              Enter your account email. We&apos;ll send a 6-digit code to reset your password.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
            <Input
              autoFocus
              isRequired
              className="max-w-full"
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
              }}
              placeholder="Enter your email address"
              type="email"
              value={forgotEmail}
              onValueChange={setForgotEmail}
            />

            <div className="flex flex-col gap-3 mt-2">
              <Button
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl shadow-md disabled:opacity-50"
                disabled={!forgotEmail.trim() || isLoadingForgot}
                type="submit"
              >
                {isLoadingForgot ? "Sending..." : "Send Reset Code"}
              </Button>
            </div>
          </form>

          <button
            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center justify-center gap-1.5 mt-2 mx-auto"
            type="button"
            onClick={() => setAuthStep('login')}
          >
            <Icon className="text-base" icon="solar:arrow-left-linear" />
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Reset Password (OTP + New Password) Step ────────────────────────────────
  if (authStep === 'reset') {
    return (
      <div className="flex w-full flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F7] text-black shadow-inner">
            <Icon className="text-3xl" icon="solar:letter-bold-duotone" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-black">Check Your Email</h1>
            <p className="text-center text-gray-500 text-sm mt-2 font-medium max-w-xs">
              Enter the 6-digit code sent to <span className="font-semibold text-black">{forgotEmail}</span> and choose a new password.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            {/* OTP input */}
            <Input
              autoFocus
              isRequired
              className="max-w-full"
              classNames={{
                inputWrapper:
                  "h-14 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-center font-mono text-2xl tracking-[0.5em] pl-[0.25em] text-black font-semibold",
              }}
              maxLength={6}
              placeholder="000000"
              type="text"
              value={resetOtp}
              onValueChange={(val) => {
                const digitsOnly = val.replace(/\D/g, "");
                if (digitsOnly.length <= 6) setResetOtp(digitsOnly);
              }}
            />

            {/* New password input */}
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
              }}
              endContent={
                newPasswordValue.length > 0 && (
                  <button
                    className="hover:opacity-70 transition-opacity"
                    type="button"
                    onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  >
                    {isNewPasswordVisible ? (
                      <svg className="text-gray-400" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
                      <svg className="text-gray-400" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                )
              }
              placeholder="New password (min. 8 characters)"
              type={isNewPasswordVisible ? "text" : "password"}
              value={newPasswordValue}
              onValueChange={setNewPasswordValue}
            />

            <div className="flex flex-col gap-3 mt-2">
              <Button
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl shadow-md disabled:opacity-50"
                disabled={resetOtp.length !== 6 || newPasswordValue.length < 8 || isLoadingReset}
                type="submit"
              >
                {isLoadingReset ? "Updating..." : "Set New Password"}
              </Button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-2 mt-1">
            <button
              className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
              type="button"
              onClick={() => setAuthStep('forgot')}
            >
              Didn&apos;t receive a code? Resend
            </button>
            <button
              className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center justify-center gap-1.5"
              type="button"
              onClick={() => setAuthStep('login')}
            >
              <Icon className="text-base" icon="solar:arrow-left-linear" />
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MFA Step ────────────────────────────────────────────────────────────────
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
                    "h-14 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
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
                className="w-full h-12 font-semibold bg-black text-white rounded-2xl shadow-md disabled:opacity-50"
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
        <img
          alt="Inso Logo Icon"
          className="h-10 w-auto opacity-90 mb-8 web-only block lg:hidden"
          src="/logo-black.png"
        />
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          <span className="desktop-only-block hidden">Build The Future</span>
          <span className="web-only">Welcome Back</span>
        </h1>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Input
              className="max-w-full"
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light [&:-webkit-autofill]:[-webkit-text-fill-color:black]",
              }}
              name="email"
              placeholder="Enter Email"
              type="email"
              variant="flat"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light [&:-webkit-autofill]:[-webkit-text-fill-color:black]",
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
                onClick={() => setAuthStep('forgot')}
              >
                Forgot password?
              </button>
            </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              className="w-full h-12 font-semibold bg-black text-white rounded-2xl shadow-md"
              type="submit"
            >
              Login
            </Button>
          </div>
        </form>

        <div className="web-only">
          <p className="text-center text-sm text-gray-500 font-medium mt-4">
            Don&apos;t have an account?{" "}
            <button
              className="font-semibold text-black hover:underline transition-all cursor-pointer bg-transparent border-none p-0 inline-block font-sans text-sm"
              type="button"
              onClick={() => router.push("/register")}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
