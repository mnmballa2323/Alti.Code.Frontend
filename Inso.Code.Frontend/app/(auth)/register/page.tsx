"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [selectedCloud, setSelectedCloud] = useState("");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const companyName = formData.get("companyName") as string;
    const preferredCloud = formData.get("preferredCloud") as string;
    const deploymentTier = formData.get("deploymentTier") as string;

    if (!companyName || !companyName.trim()) {
      toast.error("Company Name is required");

      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    // Validate corporate domain
    const personalDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "aol.com",
      "zoho.com",
      "proton.me",
      "protonmail.com",
      "gmx.com",
      "yandex.com",
      "mail.com",
    ];
    const emailDomain = email.split("@")[1]?.toLowerCase();

    if (emailDomain && personalDomains.includes(emailDomain)) {
      toast.error(
        "Please use a valid company email address (personal emails not allowed).",
      );

      return;
    }

    const loading = toast.loading("Creating account...");

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
            companyName,
            preferredCloud,
            deploymentTier,
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
      <div className="flex flex-col items-center text-center">
        <img
          alt="Inso Logo Icon"
          className="h-10 w-auto opacity-90 mb-8 lg:hidden block"
          src="/logo-black.png"
        />
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Create Account
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
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
              }}
              name="companyName"
              placeholder="Company Name"
              type="text"
              variant="flat"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              className="max-w-full"
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
              }}
              name="email"
              placeholder="Company Email"
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
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
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
              classNames={{
                inputWrapper:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                input:
                  "text-black text-[13px] font-light placeholder:text-[13px] placeholder:font-light",
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

          <div className="flex flex-col gap-1.5">
            <Select
              className="max-w-full"
              classNames={{
                trigger:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                value:
                  "text-zinc-400 data-[has-value=true]:text-black text-[13px] font-light",
              }}
              name="preferredCloud"
              placeholder="Select Cloud Provider"
              selectedKeys={selectedCloud ? [selectedCloud] : []}
              variant="flat"
              onSelectionChange={(keys) =>
                setSelectedCloud(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="gcp">Google Cloud Platform (GCP)</SelectItem>
              <SelectItem key="aws">Amazon Web Services (AWS)</SelectItem>
              <SelectItem key="azure">Microsoft Azure</SelectItem>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Select
              className={`max-w-full ${!selectedCloud ? "pointer-events-none select-none" : ""}`}
              classNames={{
                trigger:
                  "h-12 bg-gray-100 !bg-gray-100 hover:!bg-gray-100 focus-within:!bg-gray-100 data-[focus=true]:!bg-gray-100 data-[hover=true]:!bg-gray-100 rounded-2xl border-none shadow-none !ring-0 !outline-none data-[focus=true]:!ring-0 data-[focus=true]:!outline-none",
                value:
                  "text-zinc-400 data-[has-value=true]:text-black text-[13px] font-light",
              }}
              name="deploymentTier"
              placeholder="Select Deployment Option"
              variant="flat"
            >
              <SelectItem key="MULTI_TENANT">
                Multi-Tenant (Standard)
              </SelectItem>
              <SelectItem key="SINGLE_TENANT">
                Single-Tenant (Dedicated DB)
              </SelectItem>
              <SelectItem key="FEDRAMP">FedRAMP (Government)</SelectItem>
            </Select>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              className="w-full h-12 font-semibold bg-black text-white rounded-2xl shadow-md"
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
          <button
            className="font-semibold text-black hover:underline transition-all cursor-pointer bg-transparent border-none p-0 inline-block font-sans text-sm"
            type="button"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
